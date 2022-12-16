import { IBiome } from '../biome';

// Biome
const grass: IBiome<'rock'> = {
  name: 'rock',
  texture: new URL('./flat.png', import.meta.url),
  colors: {
    main: '#b98b5d'
  }
};

export default grass;
