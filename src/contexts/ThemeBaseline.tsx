'use client';

import { ReactNode, useContext, useMemo } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { ColorModeContext } from '@/contexts/ColorModeProvider';
import createTheme from '@/theme';

// Types
export interface ThemeBaselineProps {
  children: ReactNode;
}

// Layout
export default function ThemeBaseline({ children }: ThemeBaselineProps) {
  const { colorMode } = useContext(ColorModeContext);

  // Memo
  const theme = useMemo(() => createTheme(colorMode), [colorMode]);

  // Render
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      { children }
    </ThemeProvider>
  );
}
