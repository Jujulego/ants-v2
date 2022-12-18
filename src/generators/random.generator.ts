import { Point } from '@jujulego/2d-maths';
import { inject, injectable } from 'inversify';
import seedrandom from 'seedrandom';

import { BST } from '@/utils/bst';

import { TileGenerator, TileGeneratorOptions } from './tile.generator';

// Types
export interface RandomGeneratorOpts {
  readonly seed: string;
  readonly biomes: Record<string, number>;
}

type Cumulated = [biome: string, f: number];

// Class
@injectable()
export class RandomGenerator extends TileGenerator<RandomGeneratorOpts> {
  // Attributes
  private readonly _biomes: BST<Cumulated, number>;

  // Constructor
  constructor(
    @inject(TileGeneratorOptions)
    private readonly _options: RandomGeneratorOpts,
  ) {
    super();

    this._biomes = this._cumulate(_options.biomes);
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

  protected applyOn(pos: Point): string {
    const prng = seedrandom(`${this._options.seed}-${pos.x}-${pos.y}`);
    const res = this._biomes.nearest(prng.quick(), 'lte')!;

    return res[0];
  }
}
