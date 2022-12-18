import { Point } from '@jujulego/2d-maths';
import { inject, injectable } from 'inversify';

// Constant
export const TileGeneratorOptions = Symbol('ants-v2:TileGeneratorOptions');

// Types
export interface TileGeneratorType<Opts = unknown> {
  new (...args: any[]): TileGenerator<Opts>;
}

// Generator
@injectable()
export abstract class TileGenerator<Opts = unknown> {
  // Constructor
  constructor(
    @inject(TileGeneratorOptions) protected readonly _options: Opts,
  ) {}

  // Methods
  abstract generate(pos: Point): string;
}
