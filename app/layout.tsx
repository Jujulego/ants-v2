import { ReactNode } from 'react';

// Types
export interface RootLayoutProps {
  children: ReactNode;
}

// Layout
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body>{ children }</body>
    </html>
  );
}
