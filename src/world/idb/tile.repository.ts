import { IPoint } from '@jujulego/2d-maths';
import { Dexie } from 'dexie';
import { injectable } from 'inversify';

import { ITile, tileKey } from '@/world/tile';
import { IWorld } from '@/world/world';

import { DexieDatabase, type ITileEntity, ITileKey, TILES_XY_INDEX } from './dexie';

// Repository
@injectable()
export class TileRepository {
  // Constructor
  constructor(
    private readonly _database: DexieDatabase
  ) {}

  // Methods
  private _loadVersion(entity: ITileEntity, version?: number): ITile {
    if (version !== undefined) {
      return { pos: entity.pos, biome: entity.history[version] ?? entity.biome };
    }

    return { pos: entity.pos, biome: entity.biome };
  }

  private _update(old: ITileEntity, tile: ITile, version?: number): ITileEntity {
    if (version !== undefined) {
      while (old.history.length <= version) {
        old.history.push(old.biome);
      }

      while (old.history.length > version) {
        old.history.pop();
      }

      old.history[version] = tile.biome;
    } else {
      old.history.push(tile.biome);
    }

    return {
      world: old.world,
      pos: old.pos,
      biome: tile.biome,
      history: old.history,
    };
  }

  async load(world: IWorld, collection: Dexie.Collection<ITileEntity, ITileKey>): Promise<ITile[]> {
    const entities = await collection.toArray();

    return entities.map((ent) => this._loadVersion(ent, world.version));
  }

  async get(world: IWorld, pos: IPoint): Promise<ITile> {
    // Load entity
    const entity = await this.table.get([world.world, pos.x, pos.y]);

    if (!entity) {
      throw new Error(`Tile ${world.world}:${pos.x},${pos.y} not found`);
    }

    return this._loadVersion(entity, world.version);
  }

  async bulkGet(world: IWorld, pos: IPoint[]): Promise<ITile[]> {
    // Load tiles
    const keys = pos.map((pt) => [world.world, pt.x, pt.y] as const);
    const tiles: ITile[] = [];

    for (const tile of await this.table.bulkGet(keys)) {
      if (tile) {
        tiles.push(this._loadVersion(tile, world.version));
      }
    }

    return tiles;
  }

  async put(world: IWorld, tile: ITile): Promise<void> {
    await this._database.transaction('rw', this.table, async () => {
      let old = await this.table.get([world.world, tile.pos.x, tile.pos.y]);

      // Create item is missing
      old ??= {
        world: world.world,
        pos: tile.pos,
        biome: tile.biome,
        history: []
      };

      // Insert
      await this.table.put(this._update(old, tile, world.version));
    });
  }

  async bulkPut(world: IWorld, tiles: ITile[]): Promise<void> {
    const toAdd = new Map(tiles.map(tile => [tileKey(tile), tile]));

    // Updates
    await this.table
      .where(TILES_XY_INDEX).anyOf(tiles.map((tile) => [world.world, tile.pos.x, tile.pos.y]))
      .modify((old, ref) => {
        const tile = toAdd.get(tileKey(old));

        if (tile) { // Tile found => update
          ref.value = this._update(old, tile, world.version);
          toAdd.delete(tileKey(old));
        }
      });

    // Adds
    await this.table.bulkAdd(tiles
      .filter((tile) => toAdd.has(tileKey(tile)))
      .map((tile) => {
        const ent: ITileEntity = {
          world: world.world,
          pos: tile.pos,
          biome: tile.biome,
          history: [tile.biome],
        };

        if (world.version) {
          while (ent.history.length <= world.version) {
            ent.history.push(ent.biome);
          }
        }

        return ent;
      })
    );
  }

  // Properties
  get table() {
    return this._database.tiles;
  }
}
