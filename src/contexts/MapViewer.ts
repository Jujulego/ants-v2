'use client';

import { Rect } from '@jujulego/2d-maths';
import { createContext } from 'react';

// Types
export interface MapViewerContextProps {
  world: string;
  area: Rect;
  tileSize: number;
}

// Context
export const MapViewerContext = createContext<MapViewerContextProps>({
  world: '',
  area: new Rect({ t: 0, l: 0, r: 0, b: 0 }),
  tileSize: 32,
});
