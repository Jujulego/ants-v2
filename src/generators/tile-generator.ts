import { Shape } from '@jujulego/2d-maths';
import { EventSource } from '@jujulego/event-tree';
import { injectable } from 'inversify';

import { ITile } from '@/world/tile';
import { IWorld, parseWorld } from '@/world/world';
import { WorldService } from '@/world/world.service';

// Types
export interface TileGeneratorOpts {
  readonly shape: Shape;
  readonly chunkSize?: number;
}

export interface GeneratorProgressEvent {
  readonly count: number;
  readonly progress: number;
}

export type TileGeneratorEventMap = {
  progress: GeneratorProgressEvent;
}

// Class
@injectable()
export abstract class TileGenerator<O extends TileGeneratorOpts> extends EventSource<TileGeneratorEventMap> {
  // Constructor
  constructor(
    protected readonly client: WorldService
  ) {
    super();
  }

  // Methods
  protected abstract generate(world: IWorld, opts: O): Generator<ITile | null>;

  async run(world: string | IWorld, opts: O): Promise<void> {
    world = parseWorld(world);

    const { chunkSize = 1000 } = opts;
    const size = opts.shape.bbox.size;
    const step = Math.ceil(Math.min(chunkSize, size.dx * size.dy) / 10);

    let chunk: ITile[] = [];
    let count = 0;

    for await (const tile of this.generate(world, opts)) {
      // Progress events
      count++;

      if (count % step === 0) {
        this.emit('progress', {
          count,
          progress: count / (size.dx * size.dy),
        });
      }

      // Update
      if (tile) {
        chunk.push(tile);

        if (chunk.length >= chunkSize) {
          await this.client.bulkPutTile(world, chunk);
          chunk = [];
        }
      }
    }

    if (chunk.length > 0) {
      await this.client.bulkPutTile(world, chunk);
    }

    if (count % step !== 0) {
      this.emit('progress', {
        count,
        progress: count / (size.dx * size.dy),
      });
    }
  }
}
