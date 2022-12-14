import { type PaletteMode } from '@mui/material';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';

import { CookiesProvider } from '@/client-utils';
import ColorMode from '@/contexts/ColorMode';
import ThemeBaseline from '@/contexts/ThemeBaseline';

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
      <body>
        <CookiesProvider>
          <ColorMode defaultMode={readPrefersDarkCookie()}>
            <ThemeBaseline>
              { children }
            </ThemeBaseline>
          </ColorMode>
        </CookiesProvider>
      </body>
    </html>
  );
}
