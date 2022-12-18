import { Point } from '@jujulego/2d-maths';
import { inject, injectable } from 'inversify';

import { ITile } from '@/world/tile';

// Constant
export const TileGeneratorOptions = Symbol('ants-v2:TileGeneratorOptions');
export const TileGeneratorPrevious = Symbol('ants-v2:TileGeneratorPrevious');

// Types
export interface TileGeneratorType<Opts = unknown> {
  new (...args: any[]): TileGenerator<Opts>;
}

// Generator
@injectable()
export abstract class TileGenerator<Opts = unknown> {
  // Attributes
  private readonly __options?: Opts;

  @inject(TileGeneratorPrevious)
  private readonly _previous?: TileGenerator;

  // Methods
  protected abstract applyOn(pos: Point, base?: ITile): string;

  async generate(world: string, pos: Point): Promise<ITile> {
    const base = await this._previous?.generate(world, pos);
    const biome = this.applyOn(pos, base);

    // Build tile
    const steps = base?.generationSteps ?? [];

    return {
      pos,
      biome,
      generationSteps: [...steps, biome]
    };
  }
}
