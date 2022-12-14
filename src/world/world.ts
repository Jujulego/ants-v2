// Type
export interface IWorld {
  readonly world: string;
  readonly version?: number;
}

// Utils
export function parseWorld(world: string | IWorld): IWorld {
  if (typeof world === 'string') {
    return { world };
  }

  return world;
}
