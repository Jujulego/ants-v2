'use client';

import { rect } from '@jujulego/2d-maths';
import { NoSsr, Skeleton } from '@mui/material';
import { Suspense, useEffect } from 'react';

import { BiomeLayer } from '@/layers/BiomeLayer';
import { container } from '@/inversify.config';
import { RandomGenerator } from '@/generators/random-generator';

// Setup
const WORLD = 'test';
const AREA = rect({ x: 0, y: 0 }, { dx: 40, dy: 20 });
const SEED = 'tata';

// Component
export default function WorldMap() {
  // Effects
  useEffect(() => void (async () => {
    const generator = await container.getAsync(RandomGenerator);

    await generator.run({ world: WORLD, version: 0 }, {
      shape: AREA,
      seed: SEED,
      biomes: {
        water: 0.3,
        grass: 0.4,
        sand: 0.3,
      }
    });
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
