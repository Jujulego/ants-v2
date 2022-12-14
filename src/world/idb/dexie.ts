import { Dexie } from 'dexie';
import { injectable } from 'inversify';

import { ITile } from '@/world/tile';

// Constants
const DATABASE_NAME = 'ants-v2';
const DATABASE_VERSION = 1;

export const TILES_XY_INDEX = '[world+pos.x+pos.y]';

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
  constructor() {
    super(DATABASE_NAME);

    // Setup stores
    this.version(DATABASE_VERSION)
      .stores({
        tiles: `&${TILES_XY_INDEX}`,
      });
  }
}
