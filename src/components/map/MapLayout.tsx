'use client';

import { type IPoint, point, Point, rect, Vector, vector } from '@jujulego/2d-maths';
import { Box, Skeleton } from '@mui/material';
import { type ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { MapViewerContext } from '@/contexts/MapViewer';

// Types
export interface MapLayoutProps {
  world: string;
  tileSize?: number;
  initialPosition?: IPoint;
  children: ReactNode;
}

// Component
export default function MapLayout(props: MapLayoutProps) {
  const { world, tileSize = 32, initialPosition = Point.Origin, children } = props;
  
  // State
  const [position, setPosition] = useState(point(initialPosition));
  const [size, setSize] = useState(Vector.Null);

  // Memos
  const area = useMemo(() => rect(position.add(size.dot(-0.5).floor), size), [position, size]);

  // Refs
  const container = useRef<HTMLDivElement>(null);

  // Effect
  useEffect(() => {
    const target = container.current;
    if (!target) return;

    const obs = new ResizeObserver((entries) => {
      const { target } = entries[0];

      setSize(vector(
        Math.ceil(target.clientWidth / tileSize),
        Math.ceil(target.clientHeight / tileSize),
      ));
    });

    obs.observe(target);
    return () => obs.disconnect();
  }, [tileSize]);

  // Render
  return (
    <Box ref={container} sx={{ width: '100%', height: '100%' }}>
      <MapViewerContext.Provider value={{ world, area, position, setPosition, tileSize }}>
        <Suspense fallback={
          <Skeleton variant="rectangular" width={size.dx * tileSize} height={size.dy * tileSize} />
        }>
          { children }
        </Suspense>
      </MapViewerContext.Provider>
    </Box>
  );
}
