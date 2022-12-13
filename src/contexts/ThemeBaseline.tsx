'use client';

import { ReactNode } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import createTheme from '@/theme';

// Types
export interface ThemeBaselineProps {
  children: ReactNode;
}

// Utils
const theme = createTheme('dark');

// Layout
export default function ThemeBaseline({ children }: ThemeBaselineProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      { children }
    </ThemeProvider>
  );
}
