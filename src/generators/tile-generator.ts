import { type IShape, Point, pointsOf } from '@jujulego/2d-maths';

import { type ITile } from '@/world/tile';
import { WorldService } from '@/world/world.service';

import { BaseStep } from './steps/base-step';

// Class
export class TileGenerator {
  // Constructor
  constructor(
    private readonly _lastStep: BaseStep,
    private readonly _world: WorldService,
  ) {}

  // Methods
  async generateTile(world: string, pos: Point): Promise<void> {
    const tile = await this._lastStep.generate(pos);

    if (tile) {
      await this._world.putTile(world, tile);
    }
  }

  async generateTilesIn(world: string, shape: IShape, chunkSize = 1000): Promise<void> {
    // Store by chunks
    let chunk: ITile[] = [];

    for (const pos of pointsOf(shape)) {
      const tile = await this._lastStep.generate(pos);

      if (tile) {
        chunk.push(tile);

        if (chunk.length >= chunkSize) {
          await this._world.bulkPutTile(world, chunk);
          chunk = [];
        }
      }
    }

    if (chunk.length > 0) {
      await this._world.bulkPutTile(world, chunk);
    }
  }
}
