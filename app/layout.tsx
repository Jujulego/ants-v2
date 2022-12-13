import { cookies } from 'next/headers';
import { ReactNode } from 'react';

import { CookiesProvider } from '@/client-utils';
import ColorModeProvider from '@/contexts/ColorModeProvider';
import StyleRegistry from '@/contexts/StyleRegistry';
import ThemeBaseline from '@/contexts/ThemeBaseline';
import { PaletteMode } from '@mui/material';

// Types
export interface RootLayoutProps {
  children: ReactNode;
}

// Utils
function readPrefersDarkCookie(): PaletteMode {
  let prefersDark = cookies().get('prefers-dark')?.value;

  if (prefersDark !== 'dark' && prefersDark !== 'light') {
    prefersDark = 'light';
  }

  return prefersDark as PaletteMode;
}

// Layout
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <head />
      <body>
        <CookiesProvider>
          <StyleRegistry>
            <ColorModeProvider defaultMode={readPrefersDarkCookie()}>
              <ThemeBaseline>
                { children }
              </ThemeBaseline>
            </ColorModeProvider>
          </StyleRegistry>
        </CookiesProvider>
      </body>
    </html>
  );
}
