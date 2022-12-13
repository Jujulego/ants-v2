import { type PaletteMode } from '@mui/material';
import { createTheme as muiCreateTheme } from '@mui/material/styles';
import { Roboto } from '@next/font/google';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

export default function createTheme(mode: PaletteMode) {
  return muiCreateTheme({
    palette: {
      mode
    },
    typography: {
      fontFamily: roboto.style.fontFamily,
    }
  });
}
