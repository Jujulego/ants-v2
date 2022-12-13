'use client';

import { Typography } from '@mui/material';
import { useContext } from 'react';

import { ColorModeContext } from '@/contexts/ColorModeProvider';

// Component
export default function HomePage() {
  const { toggleColorMode } = useContext(ColorModeContext);

  return (
    <>
      <Typography variant="h1" p={2}>Hello world!</Typography>
      <button onClick={() => toggleColorMode()}>toggle</button>
    </>
  );
}
