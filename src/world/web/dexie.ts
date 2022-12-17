import { Dexie, type DexieOptions } from 'dexie';
import { inject, injectable, optional } from 'inversify';

import { container } from '@/inversify.config';
import { type ITile } from '@/world/tile';

// Constants
const DATABASE_NAME = 'ants-v2';
const DATABASE_VERSION = 1;

export const TILES_XY_INDEX = '[world+pos.x+pos.y]';

export const DEXIE_OPTIONS = Symbol('jujulego:ants-v2:dexie-options');

// Types
export type ITileKey = readonly [world: string, x: number, y: number];
export interface ITileEntity extends ITile {
  readonly world: string;
  readonly history: string[];
}

// Database
@injectable()
export class DexieDatabase extends Dexie {
  // Attributes
  tiles!: Dexie.Table<ITileEntity, ITileKey>;

  // Constructor
  constructor(
    @inject(DEXIE_OPTIONS) @optional() options?: DexieOptions
  ) {
    super(DATABASE_NAME, options);

    // Setup stores
    this.version(DATABASE_VERSION)
      .stores({
        tiles: `&${TILES_XY_INDEX}`,
      });
  }
}

// Inject
container.bind(DexieDatabase).toSelf().inSingletonScope();
