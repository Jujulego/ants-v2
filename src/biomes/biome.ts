// Interface
export interface BiomeColors {
  main: string;
}

export interface IBiome<N extends string> {
  name: N;
  texture: URL;
  colors: BiomeColors;
}
