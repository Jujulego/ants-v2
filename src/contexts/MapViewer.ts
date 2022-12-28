'use client';

import { Point, Rect } from '@jujulego/2d-maths';
import { createContext, type Dispatch, type SetStateAction } from 'react';

// Types
export interface MapViewerContextProps {
  world: string;
  area: Rect;
  position: Point;
  setPosition: Dispatch<SetStateAction<Point>>;
  tileSize: number;
}

// Context
export const MapViewerContext = createContext<MapViewerContextProps>({
  world: '',
  area: new Rect({ t: 0, l: 0, r: 0, b: 0 }),
  position: new Point({ x: 0, y: 0 }),
  setPosition: () => {},
  tileSize: 32,
});
