import { IPoint, Point, Shape } from '@jujulego/2d-maths';
import { inject, injectable, interfaces, optional } from 'inversify';

import { BST } from '@/utils/bst';
import { ITile } from '@/world/tile';

// Constant
export const TileGeneratorCache: interfaces.ServiceIdentifier<BST<ITile, IPoint>> = Symbol('ants-v2:TileGenerator#cache');
export const TileGeneratorLimit: interfaces.ServiceIdentifier<Shape> = Symbol('ants-v2:TileGenerator#limit');
export const TileGeneratorOptions = Symbol('ants-v2:TileGenerator#options');
export const TileGeneratorPrevious: interfaces.ServiceIdentifier<TileGenerator> = Symbol('ants-v2:TileGenerator#previous');

// Types
export interface TileGeneratorConfig {
  cacheBaseTiles?: boolean;
}

export interface TileGeneratorType<Opts = unknown> {
  new (...args: any[]): TileGenerator<Opts>;
}

// Generator
@injectable()
export abstract class TileGenerator<Opts = unknown> {
  // Attributes
  protected config: TileGeneratorConfig = {
    cacheBaseTiles: false,
  };


  @inject(TileGeneratorOptions)
  protected readonly options: Opts;

  @inject(TileGeneratorLimit) @optional()
  protected readonly limit?: Shape;

  @inject(TileGeneratorPrevious) @optional()
  protected readonly previousGenerator?: TileGenerator;

  @inject(TileGeneratorCache)
  protected readonly tileCache: BST<ITile, IPoint>;

  // Methods
  protected async getPreviousTile(pos: Point): Promise<ITile | undefined> {
    if (!this.previousGenerator) {
      return;
    }

    // Read cache
    if (this.config.cacheBaseTiles) {
      const cached = this.tileCache.search(pos);

      if (cached.length > 0) {
        return cached[0];
      }
    }

    // Generate tile
    const tile = await this.previousGenerator.generate(pos);

    if (tile) {
      this.tileCache.insert(tile);
    }

    return tile;
  }

  protected abstract applyOn(pos: Point, base?: ITile): string | Promise<string>;

  async generate(pos: Point): Promise<ITile | undefined> {
    const base = await this.getPreviousTile(pos);

    // Apply limit
    if (this.limit && !this.limit.contains(pos)) {
      return base && {
        pos,
        biome: base.biome,
        generationSteps: [...base.generationSteps, base.biome]
      };
    }

    // Generate
    const biome = await this.applyOn(pos, base);

    // Build tile
    const steps = base?.generationSteps ?? [];

    return {
      pos,
      biome,
      generationSteps: [...steps, biome]
    };
  }
}
