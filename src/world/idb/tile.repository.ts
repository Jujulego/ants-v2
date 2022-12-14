import { IPoint } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { ITile } from '@/world/tile';
import { IWorld } from '@/world/world';

import { DexieDatabase, type ITileEntity } from './dexie';

// Repository
@injectable()
export class TileRepository {
  // Constructor
  constructor(
    private readonly _database: DexieDatabase
  ) {}

  // Methods
  private _loadTileVersion(entity: ITileEntity, version?: number): ITile {
    if (version !== undefined) {
      return { pos: entity.pos, biome: entity.history[version] ?? entity.biome };
    }

    return { pos: entity.pos, biome: entity.biome };
  }

  async getTile(world: IWorld, pos: IPoint): Promise<ITile> {
    // Load entity
    const entity = await this._database.tiles.get([world.world, pos.x, pos.y]);

    if (!entity) {
      throw new Error(`Tile ${world.world}:${pos.x},${pos.y} not found`);
    }

    return this._loadTileVersion(entity, world.version);
  }
}
