import { pointsOf } from '@jujulego/2d-maths';
import { injectable } from 'inversify';
import seedrandom from 'seedrandom';

import { BST } from '@/utils/bst';
import { ITile } from '@/world/tile';
import { IWorld } from '@/world/world';

import { TileGenerator, TileGeneratorOpts } from './tile-generator';
import { WorldService } from '@/world/world.service';

// Types
export interface RandomGeneratorOpts extends TileGeneratorOpts {
  readonly biomes: Record<string, number>;
  readonly seed?: string;
}

type Cumulated = [biome: string, f: number];

// Class
@injectable()
export class RandomGenerator extends TileGenerator<RandomGeneratorOpts> {
  // Constructor
  constructor(client: WorldService) {
    super(client);
  }

  // Methods
  private _cumulate(biomes: Record<string, number>): BST<Cumulated, number> {
    const cumulated: Cumulated[] = [];

    // Cumulate
    let sum = 0;

    for (const biome of Object.keys(biomes)) {
      const frq = biomes[biome];

      if (frq > 0) {
        sum += frq;
        cumulated.push([biome, sum]);
      }
    }

    // Regulate
    for (let i = 0; i < cumulated.length; ++i) {
      cumulated[i][1] /= sum;
    }

    return BST.fromArray(cumulated, ([, f]) => f, (a, b) => b - a);
  }

  protected *generate(world: IWorld, opts: RandomGeneratorOpts): Generator<ITile> {
    const biomes = this._cumulate(opts.biomes);

    const cnt: Record<string, number> = {};

    for (const pos of pointsOf(opts.shape)) {
      const prng = seedrandom(`${opts.seed}-${pos.x}-${pos.y}`);
      const res = biomes.nearest(prng.quick(), 'lte');

      if (res) {
        const biome = res[0];
        cnt[biome] = (cnt[biome] ?? 0) + 1;

        yield { pos, biome };
      }
    }
  }
}
