'use client';

import { type PaletteMode, useMediaQuery } from '@mui/material';
import { createContext, ReactNode, useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie';

import { useStabilizeMediaQuery } from '@/hooks/useStabilizeMediaQuery';

// Types
export interface ColorModeContextProps {
  prefersDarkMode: boolean;
  colorMode: PaletteMode;
  toggleColorMode: () => void;
}

export interface ColorModeProps {
  defaultMode: PaletteMode;
  children: ReactNode;
}

// Context
export const ColorModeContext = createContext<ColorModeContextProps>({
  prefersDarkMode: false,
  colorMode: 'light',
  toggleColorMode: () => {},
});

// Provider
export default function ColorModeProvider({ children, defaultMode }: ColorModeProps) {
  const [cookie, setCookie] = useCookies(['prefers-dark']);

  let system = useMediaQuery('(prefers-color-scheme: dark)', {
    defaultMatches: defaultMode === 'dark'
  });

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    system = useStabilizeMediaQuery(system);
  }

  // Memos
  const prefersDarkMode = useMemo(() => cookie['prefers-dark'] ? cookie['prefers-dark'] === 'dark' : system, [cookie, system]);
  const colorMode = useMemo(() => prefersDarkMode ? 'dark' : 'light', [prefersDarkMode]);

  // Callbacks
  const toggleColorMode = useCallback(() => {
    setCookie('prefers-dark', colorMode === 'light' ? 'dark' : 'light', {
      path: '/',
      sameSite: 'lax',
      maxAge: 2592000
    });
  }, [colorMode, setCookie]);

  // Render
  return (
    <ColorModeContext.Provider value={{ prefersDarkMode, colorMode, toggleColorMode }}>
      { children }
    </ColorModeContext.Provider>
  );
}
