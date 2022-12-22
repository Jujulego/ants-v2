import { rect } from '@jujulego/2d-maths';

import BiomeLayer from '@/components/map/BiomeLayer';
import GenerateMapTiles from '@/components/map/GenerateMapTiles';
import MapLayout from '@/components/map/MapLayout';
import { Box, NoSsr } from '@/components/mui';
import { ITileGeneratorStep } from '@/generators/types';

// Setup
const WORLD = 'test';
const SEED = 'tata';

const STEPS: ITileGeneratorStep[] = [
  {
    generator: 'uniform',
    options: {
      biome: 'water',
    }
  },
  {
    generator: 'random',
    limit: rect({ x: 0, y: 0 }, { dx: 40, dy: 20 }),
    options: {
      seed: SEED,
      biomes: {
        water: 0.3,
        grass: 0.4,
        sand: 0.3,
      }
    }
  },
  {
    generator: 'cellular',
    options: undefined,
  },
  {
    generator: 'cellular',
    options: undefined,
  },
  {
    generator: 'cellular',
    options: undefined,
  },
  {
    generator: 'cellular',
    options: undefined,
  }
];

// Page
export default async function Page() {
  return (
    <Box sx={{ height: '100vh' }}>
      <NoSsr>
        <MapLayout world={WORLD}>
          <GenerateMapTiles steps={STEPS} />
          <BiomeLayer />
        </MapLayout>
      </NoSsr>
    </Box>
  );
}
