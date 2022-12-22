'use client';

import { Box, Skeleton } from '@mui/material';
import { ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { MapViewerContext } from '@/contexts/MapViewer';
import { point, rect, Rect, vector } from '@jujulego/2d-maths';

// Types
export interface MapLayoutProps {
  world: string;
  tileSize?: number;
  children: ReactNode;
}

// Component
export default function MapLayout(props: MapLayoutProps) {
  const { world, tileSize = 32, children } = props;
  
  // State
  const [area, setArea] = useState(new Rect({ t: 0, l: 0, r: 0, b: 0 }));

  // Refs
  const container = useRef<HTMLDivElement>(null);

  // Effect
  useEffect(() => {
    const target = container.current;
    if (!target) return;

    const obs = new ResizeObserver((entries) => {
      const { target } = entries[0];

      setArea(rect(
        point(-1, -5),
        vector(
          Math.ceil(target.clientWidth / tileSize),
          Math.ceil(target.clientHeight / tileSize),
        )
      ));
    });

    obs.observe(target);
    return () => obs.disconnect();
  }, [tileSize]);

  // Render
  return (
    <Box ref={container} sx={{ width: '100%', height: '100%' }}>
      <MapViewerContext.Provider value={{ world, area, tileSize }}>
        <Suspense fallback={
          <Skeleton variant="rectangular" width={area.w * tileSize} height={area.h * tileSize} />
        }>
          { children }
        </Suspense>
      </MapViewerContext.Provider>
    </Box>
  );
}
