import { injectable } from 'inversify';
import { Point, vector } from '@jujulego/2d-maths';

import { ITile } from '@/world/tile';

import { CachedStep } from './cached-step';

// Constants
const DIRECTIONS = [
  vector(0, 1),
  vector(1, 1),
  vector(1, 0),
  vector(1, -1),
  vector(0, -1),
  vector(-1, -1),
  vector(-1, 0),
  vector(-1, 1),
];

// Class
@injectable()
export class CellularStep extends CachedStep<undefined> {
  // Methods
  private async _getNeighbors(pos: Point): Promise<ITile[]> {
    const toRequest: Point[] = [];
    const result: ITile[] = [];

    // Read cache
    for (const dir of DIRECTIONS) {
      const n = pos.add(dir);
      const cached = this.tileCache.search(n);

      if (cached.length > 0) {
        result.push(cached[0]);
      } else {
        toRequest.push(n);
      }
    }

    // Request missing
    for (const req of toRequest) {
      const tile = await this.getPreviousTile(req);

      if (tile) {
        result.push(tile);
      }
    }

    // Clean cache
    this.tileCache.removeUntil(pos.add({ dx: -1, dy: -1 })); // <= will not be used later

    return result;
  }

  protected async applyOn(pos: Point, base?: ITile): Promise<string> {
    if (!base) {
      throw new Error('Cellular generator cannot be the first generator');
    }

    const neighbors = await this._getNeighbors(pos);
    const biomes: Record<string, number> = {};

    for (const n of neighbors) {
      if (!pos.equals(n.pos)) {
        biomes[n.biome] = (biomes[n.biome] ?? 0) + 1;
      }
    }

    // Update tile
    for (const [biome, cnt] of Object.entries(biomes)) {
      if (cnt > 4) {
        return biome;
      }
    }

    return base.biome;
  }
}
