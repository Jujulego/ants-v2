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
  generate(): string {
    return this._options.biome;
  }
}
