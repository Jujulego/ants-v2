import { IBiome } from '../biome';

// Biome
const grass: IBiome<'sand'> = {
  name: 'sand',
  texture: new URL('./flat.png', import.meta.url),
  colors: {
    main: '#d7d09d'
  }
};

export default grass;
