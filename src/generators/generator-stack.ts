import { Point, pointsOf, Shape } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { container } from '@/inversify.config';
import { type ITile } from '@/world/tile';
import { WorldService } from '@/world/world.service';

import {
  TileGenerator,
  TileGeneratorLimit,
  TileGeneratorOptions,
  TileGeneratorPrevious,
  type TileGeneratorType
} from './tile.generator';
import { RandomGenerator } from './random.generator';
import { UniformGenerator } from './uniform.generator';
import { WorldStackService } from './world-stack.service';

// Constants
const GENERATORS = {
  'random': RandomGenerator,
  'uniform': UniformGenerator,
};// satisfies Record<string, TileGeneratorType>;

// Types
type TileGeneratorKey = keyof typeof GENERATORS;
type TileGeneratorOptionMap = {
  [K in TileGeneratorKey]: (typeof GENERATORS)[K] extends TileGeneratorType<infer O> ? O : never;
};

export interface GeneratorStackStep<K extends TileGeneratorKey = TileGeneratorKey> {
  readonly generator: K;
  readonly limit?: Shape;
  readonly options: TileGeneratorOptionMap[K];
}

// Class
@injectable()
export class GeneratorStack {
  // Attributes
  private _generator?: TileGenerator;

  // Constructor
  constructor(
    private readonly _world: WorldService,
  ) {}

  // Methods
  setup(steps: GeneratorStackStep[]): void {
    if (this._generator) {
      console.warn('Stack already initiated');
      return;
    }

    for (const step of steps) {
      // Create generator ioc environment
      const env = container.createChild();

      env.bind(TileGeneratorLimit).toConstantValue(step.limit);
      env.bind(TileGeneratorOptions).toConstantValue(step.options);
      env.bind(TileGeneratorPrevious).toConstantValue(this._generator);
      env.bind(WorldService).toConstantValue(new WorldStackService(this._generator));

      // Create generator
      this._generator = env.resolve<TileGenerator>(GENERATORS[step.generator]);
    }
  }

  async generateTile(world: string, pos: Point): Promise<void> {
    if (!this._generator) {
      throw new Error('Stack not yet initiated');
    }

    const tile = await this._generator.generate(world, pos);

    if (tile) {
      await this._world.putTile(world, tile);
    }
  }

  async generateTilesIn(world: string, shape: Shape, chunkSize = 1000): Promise<void> {
    if (!this._generator) {
      throw new Error('Stack not yet initiated');
    }

    // Store by chunks
    let chunk: ITile[] = [];

    for (const pos of pointsOf(shape)) {
      const tile = await this._generator.generate(world, pos);

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

// Inject
container.bind(GeneratorStack).toSelf().inRequestScope();
