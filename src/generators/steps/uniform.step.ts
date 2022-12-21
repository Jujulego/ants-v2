import { Point } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { BaseStep } from './base-step';

// Types
export interface UniformGeneratorOpts {
  readonly biome: string;
}

// Class
@injectable()
export class UniformStep extends BaseStep<UniformGeneratorOpts> {
  // Methods
  protected async applyOn(pos: Point): Promise<string> {
    return this.options.biome;
  }
}
