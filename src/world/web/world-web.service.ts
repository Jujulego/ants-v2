import { type IPoint, Rect } from '@jujulego/2d-maths';
import { Dexie } from 'dexie';
import { injectable } from 'inversify';

import { container } from '@/inversify.config';
import { type ITile } from '@/world/tile';
import { type IWorld, parseWorld } from '@/world/world';
import { WorldService } from '@/world/world.service';

import { DexieDatabase, TILES_XY_INDEX } from './dexie';
import { TileRepository } from './tile.repository';

// Repository
@injectable()
export class WorldWebService extends WorldService {
  // Constructor
  constructor(
    private readonly _database: DexieDatabase,
    private readonly _tiles: TileRepository,
  ) {
    super();
  }

  // Methods
  override loadTilesIn(world: string | IWorld, bbox: Rect): Promise<ITile[]> {
    const w = parseWorld(world);

    return this._tiles.load(w, this._tiles.table
      .where(TILES_XY_INDEX).between([w.world, bbox.l, bbox.b], [w.world, bbox.r, bbox.t])
      .filter((tile) => bbox.contains(tile.pos))
    );
  }

  override getTile(world: string | IWorld, pos: IPoint): Promise<ITile> {
    return this._tiles.get(parseWorld(world), pos);
  }

  override bulkGetTile(world: string | IWorld, pos: IPoint[]): Promise<ITile[]> {
    return this._tiles.bulkGet(parseWorld(world), pos);
  }

  override putTile(world: string | IWorld, tile: ITile): Promise<void> {
    return this._tiles.put(parseWorld(world), tile);
  }

  override bulkPutTile(world: string | IWorld, tiles: ITile[]): Promise<void> {
    return this._tiles.bulkPut(parseWorld(world), tiles);
  }

  async clear(world: string): Promise<void>{
    await this._tiles.table
      .where(TILES_XY_INDEX).between([world, Dexie.minKey, Dexie.minKey], [world, Dexie.maxKey, Dexie.maxKey])
      .delete();
  }
}

// Inject
container.bind(WorldWebService).toSelf().inSingletonScope();
