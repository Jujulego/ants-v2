import { Dexie, type DexieOptions } from 'dexie';
import { decorate, inject, injectable, interfaces, optional, unmanaged } from 'inversify';

import { container } from '@/inversify.config';
import { type ITile } from '@/world/tile';

// Symbols
export const DEXIE_OPTIONS: interfaces.ServiceIdentifier<DexieOptions> = Symbol('jujulego:ants-v2:dexie-options');

// Constants
const DATABASE_NAME = 'ants-v2';

export const TILES_XY_INDEX = '[world+pos.x+pos.y]';

// Types
export type ITileKey = readonly [world: string, x: number, y: number];
export interface ITileEntity extends ITile {
  readonly world: string;
}

// Database
@injectable()
export class DexieDatabase extends Dexie {
  // Attributes
  tiles!: Dexie.Table<ITileEntity, ITileKey>;

  // Constructor
  constructor(
    @inject(DEXIE_OPTIONS) @optional() options: DexieOptions | undefined
  ) {
    super(DATABASE_NAME, options);

    // Setup stores
    this.version(1).stores({ tiles: `&${TILES_XY_INDEX}` });
    this.version(2).stores({ tiles: `&${TILES_XY_INDEX}` }).upgrade((tx) => {
      return tx.table('tiles').toCollection().modify((tiles) => {
        tiles.generationSteps = tiles.history;
        delete tiles.history;
      });
    });
  }
}

// Inject
decorate(injectable(), Dexie);
decorate(unmanaged(), Dexie, 0);
decorate(unmanaged(), Dexie, 1);

container.bind(DexieDatabase).toSelf().inSingletonScope();
