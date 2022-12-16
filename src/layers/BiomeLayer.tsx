'use client';

import { IPoint, matrix, Rect } from '@jujulego/2d-maths';
import { styled } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { FC, useMemo } from 'react';

import { BiomeName, BIOMES } from '@/biomes';
import { container } from '@/inversify.config';
import { tileKey } from '@/world/tile';
import { WorldWebService } from '@/world/web/world-web.service';
import { IWorld } from '@/world/world';

// Types
export interface BiomeLayerProps {
  readonly world: string | IWorld;
  readonly area: Rect;
}

interface TileProps {
  readonly pos: IPoint;
}

interface LayerProps {
  readonly s: number;
}

// Styles
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
export const BiomeLayer: FC<BiomeLayerProps> = (props) => {
  // Load tiles
  const worldClient = useMemo(() => container.get(WorldWebService), []);
  const tiles = useLiveQuery(() => worldClient.loadTilesIn(props.world, props.area), [props.world, props.area, worldClient], []);

  // Memos
  const toScreen = useMemo(() => matrix({
    a: 1, c: 0,
    b: 0, d: -1,
    tx: props.area.l < 0 ? -props.area.l : 0,
    ty: (props.area.b < 0 ? 2 * props.area.b : 0) + props.area.size.dy
  }), [props.area]);

  // Render
  return (
    <Layer s={32}>
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
