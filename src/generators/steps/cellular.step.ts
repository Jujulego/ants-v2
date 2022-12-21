import { injectable } from 'inversify';
import { Point, vector } from '@jujulego/2d-maths';

import { ITile } from '@/world/tile';

import { CachedStep } from './cached-step';

// Constants
const DIRECTIONS = [
  vector(-1, -1),
  vector(0, -1),
  vector(1, -1),
  vector(-1, 0),
  vector(1, 0),
  vector(-1, 1),
  vector(0, 1),
  vector(1, 1),
];

// Class
@injectable()
export class CellularStep extends CachedStep<undefined> {
  // Methods
  protected async applyOn(pos: Point, base?: ITile): Promise<string> {
    try {
      if (!base) {
        throw new Error('Cellular must not be the first step');
      }

      const biomes: Record<string, number> = {};

      for (const dir of DIRECTIONS) {
        // Get neighbor
        const tile = await this.getPreviousTile(pos.add(dir));

        if (!tile) {
          continue;
        }

        // Compute
        biomes[tile.biome] = (biomes[tile.biome] ?? 0) + 1;

        if (biomes[tile.biome] > 4) {
          return tile.biome;
        }
      }

      return base.biome;
    } finally {
      // Clear cache
      this.tileCache.removeUntil(pos.add({ dx: -1, dy: -1 })); // <= will not be used later
    }
  }
}
