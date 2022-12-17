import { pointsOf } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { container } from '@/inversify.config';
import { type ITile } from '@/world/tile';
import { type IWorld } from '@/world/world';
import { WorldService } from '@/world/world.service';

import { TileGenerator, TileGeneratorOpts } from './tile-generator';

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

// Inject
container.bind(UniformGenerator).toSelf().inRequestScope();
