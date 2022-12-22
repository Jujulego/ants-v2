'use client';

import { IPoint, matrix } from '@jujulego/2d-maths';
import { styled } from '@mui/material';
import { useContext, useMemo } from 'react';

import { BiomeName, BIOMES } from '@/biomes';
import { MapViewerContext } from '@/contexts/MapViewer';
import { useMapTiles } from '@/hooks/useMapTiles';
import { tileKey } from '@/world/tile';

// Types
interface TileProps {
  readonly pos: IPoint;
}

interface LayerProps {
  readonly s: number;
}

// Styled components
const Tile = styled('img', { skipSx: true })<TileProps>(({ pos }) => ({
  height: '100%',
  width: '100%',
  gridRow: pos.y,
  gridColumn: pos.x + 1,
  zIndex: 0
}));

const Layer = styled('div', { skipSx: true })<LayerProps>((props) => ({
  display: 'grid',
  gridAutoRows: props.s,
  gridAutoColumns: props.s,
}));

// Components
export default function BiomeLayer() {
  const { area, tileSize } = useContext(MapViewerContext);
  const tiles = useMapTiles();

  // Memos
  const toScreen = useMemo(() => matrix({
    a: 1, c: 0,
    b: 0, d: -1,
    tx: area.l < 0 ? -area.l : 0,
    ty: (area.b < 0 ? area.b : 0) + area.size.dy
  }), [area]);

  // Render
  return (
    <Layer s={tileSize}>
      { tiles.map((tile) => (
        <Tile
          key={tileKey(tile)}
          pos={toScreen.dot(tile.pos)}
          src={BIOMES[tile.biome as BiomeName]?.texture?.toString()}
          alt={tile.biome}
        />
      )) }
    </Layer>
  );
};
