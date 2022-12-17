import { type IBiome } from '../biome';

// Biome
const grass: IBiome<'grass'> = {
  name: 'grass',
  texture: new URL('./flat.png', import.meta.url),
  colors: {
    main: '#8ab549'
  }
};

export default grass;
