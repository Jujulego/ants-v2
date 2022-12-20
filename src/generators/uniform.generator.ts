import { Point } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { TileGenerator } from './tile.generator';

// Types
export interface UniformGeneratorOpts {
  readonly biome: string;
}

// Class
@injectable()
export class UniformGenerator extends TileGenerator<UniformGeneratorOpts> {
  // Methods
  protected async applyOn(pos: Point): Promise<string> {
    return this.options.biome;
  }
}
