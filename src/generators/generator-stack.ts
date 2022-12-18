import { Point, pointsOf, Shape } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { container } from '@/inversify.config';
import { type ITile } from '@/world/tile';
import { WorldService } from '@/world/world.service';

import { TileGenerator, TileGeneratorOptions, type TileGeneratorType } from './tile.generator';
import { RandomGenerator } from './random.generator';
import { UniformGenerator } from './uniform.generator';
import { WorldStackService } from '@/generators/world-stack.service';

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
  readonly options: TileGeneratorOptionMap[K];
}

// Class
@injectable()
export class GeneratorStack {
  // Attributes
  private _initiated = false;
  private _generators: TileGenerator[] = [];

  // Constructor
  constructor(
    private readonly _world: WorldService,
  ) {}

  // Methods
  setup(steps: GeneratorStackStep[]): void {
    if (this._initiated) {
      console.warn('Stack already initiated');
      return;
    }

    for (const step of steps) {
      // Create generator ioc environment
      const env = container.createChild();

      env.bind(WorldService).toConstantValue(new WorldStackService(this._generators[this._generators.length - 1]));
      env.bind(TileGeneratorOptions).toConstantValue(step.options);

      // Create generator
      const generator = env.resolve<TileGenerator>(GENERATORS[step.generator]);
      this._generators.push(generator);
    }

    this._initiated = true;
  }

  private _generateTile(pos: Point): ITile {
    // Generation
    const steps: string[] = [];

    for (const generator of this._generators) {
      const res = generator.generate(pos);
      steps.push(res);
    }

    // Store
    return {
      pos,
      biome: steps[steps.length - 1],
      generationSteps: steps,
    };
  }

  async generateTile(world: string, pos: Point): Promise<void> {
    if (!this._initiated) {
      throw new Error('Stack not yet initiated');
    }

    const tile = this._generateTile(pos);
    await this._world.putTile(world, tile);
  }

  async generateTilesIn(world: string, shape: Shape, chunkSize = 1000): Promise<void> {
    if (!this._initiated) {
      throw new Error('Stack not yet initiated');
    }

    // Store by chunks
    let chunk: ITile[] = [];

    for (const pos of pointsOf(shape)) {
      chunk.push(this._generateTile(pos));

      if (chunk.length >= chunkSize) {
        await this._world.bulkPutTile(world, chunk);
        chunk = [];
      }
    }

    if (chunk.length > 0) {
      await this._world.bulkPutTile(world, chunk);
    }
  }
}

// Inject
container.bind(GeneratorStack).toSelf().inRequestScope();
