import { type IPoint, Shape } from '@jujulego/2d-maths';
import { Dexie } from 'dexie';
import { injectable } from 'inversify';

import { container } from '@/inversify.config';
import { type ITile } from '@/world/tile';
import { WorldService } from '@/world/world.service';

import { DexieDatabase, TILES_XY_INDEX } from './dexie';

// Repository
@injectable()
export class WorldWebService extends WorldService {
  // Constructor
  constructor(
    private readonly _database: DexieDatabase,
  ) {
    super();
  }

  // Methods
  override loadTilesIn(world: string, shape: Shape): Promise<ITile[]> {
    return this.tiles
      .where(TILES_XY_INDEX).between([world, shape.bbox.l, shape.bbox.b], [world, shape.bbox.r, shape.bbox.t])
      .filter((tile) => shape.contains(tile.pos))
      .toArray();
  }

  override async getTile(world: string, pos: IPoint): Promise<ITile> {
    const tile = await this.tiles.get([world, pos.x, pos.y]);

    if (!tile) {
      throw new Error(`Tile ${world}:${pos.x},${pos.y} not found`);
    }

    return tile;
  }

  override bulkGetTile(world: string, pos: IPoint[]): Promise<ITile[]> {
    return this.tiles
      .where(TILES_XY_INDEX).anyOf(pos.map((pt) => [world, pt.x, pt.y]))
      .toArray();
  }

  override async putTile(world: string, tile: ITile): Promise<void> {
    await this.tiles.put({ ...tile, world });
  }

  override async bulkPutTile(world: string, tiles: ITile[]): Promise<void> {
    await this.tiles.bulkPut(tiles.map((tile) => ({ ...tile, world })));
  }

  async clear(world: string): Promise<void>{
    await this.tiles
      .where(TILES_XY_INDEX).between([world, Dexie.minKey, Dexie.minKey], [world, Dexie.maxKey, Dexie.maxKey])
      .delete();
  }

  // Properties
  get tiles() {
    return this._database.tiles;
  }
}

// Inject
container.bind(WorldWebService).toSelf().inSingletonScope();
