'use client';

import { rect } from '@jujulego/2d-maths';
import { NoSsr, Skeleton } from '@mui/material';
import { Suspense, useEffect } from 'react';

import { ITileGeneratorStep } from '@/generators/tile-generator.factory';
import { TileGeneratorWorker } from '@/generators/tile-generator.worker';
import { BiomeLayer } from '@/layers/BiomeLayer';

// Setup
const WORLD = 'test';
const AREA = rect({ x: -1, y: -1 }, { dx: 42, dy: 22 });
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

// Component
export default function WorldMap() {
  // Effects
  useEffect(() => void (async () => {
    const generator = new TileGeneratorWorker();
    await generator.setup(STEPS);
    await generator.generateTilesIn(WORLD, AREA);

    // const generator = await container.get(TileGeneratorFactory)(STEPS);
    //
    // performance.mark('generation-start');
    // await generator.generateTilesIn(WORLD, AREA);
    // performance.mark('generation-end');
    //
    // const duration = performance.measure('generation-duration', 'generation-start', 'generation-end');
    // console.info(`generation took ${duration.duration}ms`);
  })(), []);

  // Render
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width={AREA.w * 32} height={AREA.h * 32} />}
    >
      <NoSsr>
        <BiomeLayer world={WORLD} area={AREA} />
      </NoSsr>
    </Suspense>
  );
}
