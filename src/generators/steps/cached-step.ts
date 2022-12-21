import { IPoint, Point } from '@jujulego/2d-maths';
import { injectable } from 'inversify';

import { BST } from '@/utils/bst';
import { ITile } from '@/world/tile';

import { BaseStep } from './base-step';

// Generator
@injectable()
export abstract class CachedStep<Opts = unknown> extends BaseStep<Opts> {
  // Attributes
  protected readonly tileCache = BST.empty<ITile, IPoint>((tile) => tile.pos, Point.comparator());

  // Methods
  protected async getPreviousTile(pos: Point): Promise<ITile | undefined> {
    if (!this.previousGenerator) {
      return;
    }

    // Read cache
    const cached = this.tileCache.search(pos);

    if (cached.length > 0) {
      return cached[0];
    }

    // Generate tile
    const tile = await this.previousGenerator.generate(pos);

    if (tile) {
      this.tileCache.insert(tile);
    }

    return tile;
  }
}
