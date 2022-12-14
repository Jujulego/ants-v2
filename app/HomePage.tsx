'use client';

import { Button, Grid, Typography } from '@mui/material';
import { useContext } from 'react';

import { ColorModeContext } from '@/contexts/ColorModeProvider';

// Component
export default function HomePage() {
  const { toggleColorMode } = useContext(ColorModeContext);

  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography variant="h1" p={2}>Hello world!</Typography>
      </Grid>
      <Grid item xs={4}>
        <Button onClick={() => toggleColorMode()} variant="contained">toggle</Button>
      </Grid>
    </Grid>
  );
}
