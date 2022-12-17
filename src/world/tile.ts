import { type IPoint } from '@jujulego/2d-maths';

// Interface
/**
 * Square unit of ground
 */
export interface ITile {
  /**
   * Position of this tile in the world
   */
  readonly pos: IPoint;

  /**
   * Environment kind in the tile
   */
  readonly biome: string;
}

// Utils
export function tileKey(tile: ITile): string {
  return `${tile.pos.x},${tile.pos.y}`;
}
