'use client';

import { $queryfy } from '@jujulego/aegis';
import { useLiveQuery } from 'dexie-react-hooks';
import { useContext } from 'react';

import { MapViewerContext } from '@/contexts/MapViewer';
import { useQuery } from '@/hooks/useQuery';
import { container } from '@/inversify.config';
import { ITile } from '@/world/tile';
import { WorldService } from '@/world/world.service';

// Utils
const $worldService = $queryfy(container.getAsync(WorldService));

// Hook
export function useMapTiles(): ITile[] {
  const { world, area } = useContext(MapViewerContext);

  // Services
  const worldService = useQuery($worldService, true);

  // Load tiles
  return useLiveQuery(() => worldService.loadTilesIn(world, area), [world, area], []);
}
