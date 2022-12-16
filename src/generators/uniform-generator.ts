import { pointsOf } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { ITile } from '@/world/tile';
import { IWorld } from '@/world/world';

import { TileGenerator, TileGeneratorOpts } from './tile-generator';
import { WorldService } from '@/world/world.service';

// Types
export interface UniformGeneratorOpts extends TileGeneratorOpts {
  readonly biome: string;
}

// Class
@injectable()
export class UniformGenerator extends TileGenerator<UniformGeneratorOpts> {
  // Constructor
  constructor(client: WorldService) {
    super(client);
  }

  // Methods
  protected *generate(world: IWorld, opts: UniformGeneratorOpts): Generator<ITile> {
    for (const pos of pointsOf(opts.shape)) {
      yield {
        pos,
        biome: opts.biome,
      };
    }
  }
}
