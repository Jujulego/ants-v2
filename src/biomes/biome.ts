// Interface
export interface IBiomeColors {
  main: string;
}

export interface IBiome<N extends string> {
  name: N;
  texture: URL;
  colors: IBiomeColors;
}
