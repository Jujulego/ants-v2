import { rect } from '@jujulego/2d-maths';

import BiomeLayer from '@/components/map/BiomeLayer';
import GenerateMapTiles from '@/components/map/GenerateMapTiles';
import MapLayout from '@/components/map/MapLayout';
import { Box, NoSsr } from '@/components/mui';
import { type ITileGeneratorStep } from '@/generators/types';
import KeepIn from '@/components/map/KeepIn';

// Setup
const WORLD = 'test';
const SEED = 'tata';
const ZONE = rect({ x: 0, y: 0 }, { dx: 40, dy: 20 });

const STEPS = [
  {
    generator: 'uniform',
    options: {
      biome: 'water',
    }
  },
  {
    generator: 'random',
    limit: ZONE,
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
] satisfies ITileGeneratorStep[];

// Page
export default async function Page() {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <NoSsr>
        <MapLayout world={WORLD} initialPosition={ZONE.bl.add(ZONE.size.dot(0.5).floor)}>
          <KeepIn zone={ZONE} />
          <GenerateMapTiles steps={STEPS} />
          <BiomeLayer />
        </MapLayout>
      </NoSsr>
    </Box>
  );
}
