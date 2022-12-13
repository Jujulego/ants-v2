import { ReactNode } from 'react';

import StyleRegistry from '@/contexts/StyleRegistry';
import ThemeBaseline from '@/contexts/ThemeBaseline';

// Types
export interface RootLayoutProps {
  children: ReactNode;
}

// Layout
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <head />
      <body>
        <StyleRegistry>
          <ThemeBaseline>
            { children }
          </ThemeBaseline>
        </StyleRegistry>
      </body>
    </html>
  );
}
