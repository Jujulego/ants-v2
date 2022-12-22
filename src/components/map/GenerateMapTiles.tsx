'use client';

import { useContext, useEffect } from 'react';

import { MapViewerContext } from '@/contexts/MapViewer';
import { TileWorker } from '@/generators/tile-worker';
import { type ITileGeneratorStep } from '@/generators/types';

// Types
export interface TileGeneratorProps {
  steps: ITileGeneratorStep[];
}

// Utils
const worker = new TileWorker();

// Component
export default function GenerateMapTiles({ steps }: TileGeneratorProps) {
  const { world, area } = useContext(MapViewerContext);

  // Effects
  useEffect(() => {
    (async () => {
      await worker.setup(steps);
      await worker.generateTilesIn(world, area);
    })();
  }, [steps, world, area]);

  return null;
}
