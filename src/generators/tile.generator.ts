import { Point, Shape } from '@jujulego/2d-maths';
import { inject, injectable } from 'inversify';

import { ITile } from '@/world/tile';

// Constant
export const TileGeneratorLimit = Symbol('ants-v2:TileGenerator#limit');
export const TileGeneratorOptions = Symbol('ants-v2:TileGenerator#options');
export const TileGeneratorPrevious = Symbol('ants-v2:TileGenerator#previous');

// Types
export interface TileGeneratorType<Opts = unknown> {
  new (...args: any[]): TileGenerator<Opts>;
}

// Generator
@injectable()
export abstract class TileGenerator<Opts = unknown> {
  // Attributes
  private readonly __options?: Opts;

  @inject(TileGeneratorLimit)
  private readonly _limit?: Shape;

  @inject(TileGeneratorPrevious)
  private readonly _previous?: TileGenerator;

  // Methods
  protected abstract applyOn(pos: Point, base?: ITile): string;

  async generate(world: string, pos: Point): Promise<ITile | undefined> {
    const base = await this._previous?.generate(world, pos);

    // Apply limit
    if (this._limit && !this._limit.contains(pos)) {
      return base && {
        pos,
        biome: base.biome,
        generationSteps: [...base.generationSteps, base.biome]
      };
    }

    // Generate
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
