import { inject, injectable } from 'inversify';

import { TileGenerator, TileGeneratorOptions } from './tile.generator';

// Types
export interface UniformGeneratorOpts {
  readonly biome: string;
}

// Class
@injectable()
export class UniformGenerator extends TileGenerator<UniformGeneratorOpts> {
  // Constructor
  constructor(
    @inject(TileGeneratorOptions)
    private readonly _options: UniformGeneratorOpts,
  ) {
    super();
  }

  // Methods
  protected applyOn(): string {
    return this._options.biome;
  }
}
