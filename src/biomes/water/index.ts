import { IBiome } from '../biome';

// Biome
const grass: IBiome<'water'> = {
  name: 'water',
  texture: new URL('./flat.png', import.meta.url),
  colors: {
    main: '#9bd3e1'
  }
};

export default grass;
