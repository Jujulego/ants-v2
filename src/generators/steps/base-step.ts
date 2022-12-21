import { Point, Shape } from '@jujulego/2d-maths';
import { inject, injectable, optional } from 'inversify';

import { type ITile } from '@/world/tile';

import { StepLimit, StepOptions, StepPrevious } from './symbols';

// Generator
@injectable()
export abstract class BaseStep<Opts = unknown> {
  // Attributes
  @inject(StepOptions)
  protected readonly options: Opts;

  @inject(StepLimit) @optional()
  protected readonly limit?: Shape;

  @inject(StepPrevious) @optional()
  protected readonly previousGenerator?: BaseStep;

  // Methods
  protected async getPreviousTile(pos: Point): Promise<ITile | undefined> {
    if (!this.previousGenerator) {
      return;
    }

    // Generate tile
    return await this.previousGenerator.generate(pos);
  }

  protected abstract applyOn(pos: Point, base?: ITile): string | Promise<string>;

  async generate(pos: Point): Promise<ITile | undefined> {
    const base = await this.getPreviousTile(pos);

    // Apply limit
    if (this.limit && !this.limit.contains(pos)) {
      return base && {
        pos,
        biome: base.biome,
        generationSteps: [...base.generationSteps, base.biome]
      };
    }

    // Generate
    const biome = await this.applyOn(pos, base);

    // Build tile
    const steps = base?.generationSteps ?? [];

    return {
      pos,
      biome,
      generationSteps: [...steps, biome]
    };
  }
}
