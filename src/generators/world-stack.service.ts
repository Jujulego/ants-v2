import { IPoint, point, pointsOf, Shape } from '@jujulego/2d-maths';

import { TileGenerator } from '@/generators/tile.generator';
import { type ITile } from '@/world/tile';
import { WorldService } from '@/world/world.service';

// Class
export class WorldStackService extends WorldService {
  // Constructor
  constructor(
    private readonly _generator?: TileGenerator,
  ) {
    super();
  }

  // Methods
  override async loadTilesIn(world: string, shape: Shape): Promise<ITile[]> {
    const tiles: ITile[] = [];

    for (const pos of pointsOf(shape)) {
      tiles.push(await this.getTile(world, pos));
    }

    return tiles;
  }

  override async getTile(world: string, pos: IPoint): Promise<ITile> {
    if (!this._generator) {
      throw new Error('Cannot fetch tile using WorldStackService on first step');
    }

    return {
      pos,
      biome: this._generator.generate(point(pos)),
      generationSteps: [], // TODO: build steps somehow
    };
  }

  override async bulkGetTile(world: string, points: IPoint[]): Promise<ITile[]> {
    const tiles: ITile[] = [];

    for (const pos of points) {
      tiles.push(await this.getTile(world, pos));
    }

    return tiles;
  }

  override putTile(world: string, tile: ITile): Promise<void> {
    throw new Error('Cannot update tile using WorldStackService');
  }

  override bulkPutTile(world: string, tiles: ITile[]): Promise<void> {
    throw new Error('Cannot update tile using WorldStackService');
  }

  override clear(world: string): Promise<void> {
    throw new Error('Cannot update tile using WorldStackService');
  }
}
