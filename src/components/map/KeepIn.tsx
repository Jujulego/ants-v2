'use client';

import { type IRect, point, rect } from '@jujulego/2d-maths';
import { useContext, useEffect } from 'react';

import { MapViewerContext } from '@/contexts/MapViewer';

// Types
export interface KeepInProps {
  zone: IRect;
}

// Component
export default function KeepIn(props: KeepInProps) {
  const { position, setPosition } = useContext(MapViewerContext);

  // Effects
  useEffect(() => {
    const zone = rect(props.zone);

    if (!zone.contains(position)) {
      const { x, y } = position;

      setPosition(point(
        Math.min(Math.max(x, zone.l), zone.r),
        Math.min(Math.max(y, zone.b), zone.t),
      ));
    }
  }, [position, setPosition, props.zone]);

  return null;
}
