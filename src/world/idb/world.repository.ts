import { IPoint, Rect } from '@jujulego/2d-maths';
import { Dexie } from 'dexie';
import {  injectable } from 'inversify';

import { ITile, tileKey } from '@/world/tile';
import { IWorld, parseWorld } from '@/world/world';
import { WorldRepository } from '@/world/world.repository';

import { DexieDatabase, type ITileEntity, TILES_XY_INDEX } from './dexie';
import { TileRepository } from './tile.repository';

// Repository
@injectable()
export class WorldIdbRepository extends WorldRepository {
  // Constructor
  constructor(
    private readonly _database: DexieDatabase,
    private readonly _tiles: TileRepository,
  ) {
    super();
  }

  // Methods
  /** @deprecated should use TileRepository */
  private _loadTileVersion(tile: ITileEntity, version?: number): ITile {
    if (version !== undefined) {
      return { pos: tile.pos, biome: tile.history[version] ?? tile.biome };
    }

    return { pos: tile.pos, biome: tile.biome };
  }

  /** @deprecated should be in TileRepository */
  private _updateTile(old: ITileEntity, tile: ITile, version?: number): ITileEntity {
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

  override getTile(world: string | IWorld, pos: IPoint): Promise<ITile> {
    return this._tiles.getTile(parseWorld(world), pos);
  }

  async getTilesIn(world: string | IWorld, bbox: Rect): Promise<ITile[]> {
    const w = parseWorld(world);

    // Load tiles
    const tiles = await this.tiles
      .where(TILES_XY_INDEX).between([w.world, bbox.l, bbox.b], [w.world, bbox.r, bbox.t])
      .filter((tile) => bbox.contains(tile.pos))
      .toArray();

    return tiles.map((tile) => this._loadTileVersion(tile, w.version));
  }

  async bulkGetTile(world: string | IWorld, pos: IPoint[]): Promise<ITile[]> {
    const w = parseWorld(world);

    // Load tiles
    const keys = pos.map((pt) => [w.world, pt.x, pt.y]);
    const tiles: ITile[] = [];

    for (const tile of await this.tiles.bulkGet(keys)) {
      if (tile) {
        tiles.push(this._loadTileVersion(tile, w.version));
      }
    }

    return tiles;
  }

  async putTile(world: string | IWorld, tile: ITile): Promise<void> {
    const w = parseWorld(world);

    // Update tile
    await this._database.transaction('rw', this.tiles, async () => {
      let old = await this.tiles.get({ world, 'pos.x': tile.pos.x, 'pos.y': tile.pos.y });

      // Create item
      old ??= {
        world: w.world,
        pos: tile.pos,
        biome: tile.biome,
        history: []
      };

      // Insert
      await this.tiles.put(this._updateTile(old, tile, w.version));
    });
  }

  async bulkPutTile(world: string | IWorld, tiles: ITile[]): Promise<void> {
    const w = parseWorld(world);
    const toAdd = new Map(tiles.map(tile => [tileKey(tile), tile]));

    // Updates
    await this.tiles
      .where(TILES_XY_INDEX).anyOf(tiles.map((tile) => [w.world, tile.pos.x, tile.pos.y]))
      .modify((old, ref) => {
        const tile = toAdd.get(tileKey(old));

        if (tile) {
          ref.value = this._updateTile(old, tile, w.version);
          toAdd.delete(tileKey(old));
        }
      });

    // Adds
    await this.tiles.bulkAdd(tiles
      .filter((tile) => toAdd.has(tileKey(tile)))
      .map((tile) => {
        const ent: ITileEntity = {
          world: w.world,
          pos: tile.pos,
          biome: tile.biome,
          history: [tile.biome],
        };

        if (w.version) {
          while (ent.history.length <= w.version) {
            ent.history.push(ent.biome);
          }
        }

        return ent;
      })
    );
  }

  async clear(world: string): Promise<void>{
    await this.tiles
      .where(TILES_XY_INDEX).between([world, Dexie.minKey, Dexie.minKey], [world, Dexie.maxKey, Dexie.maxKey])
      .delete();
  }

  get tiles() {
    return this._database.tiles;
  }
}
