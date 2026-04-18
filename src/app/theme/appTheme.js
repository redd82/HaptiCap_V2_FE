import { createTheme } from '@mui/material/styles';

const lightPalette = {
  mode: 'light',
  primary: { main: '#1B6E6A' },
  secondary: { main: '#E08E45' },
  background: {
    default: '#F4F7F9',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1F2933',
    secondary: '#52606D',
  },
};

const darkPalette = {
  mode: 'dark',
  primary: { main: '#5BC0BE' },
  secondary: { main: '#F4A259' },
  background: {
    default: '#101A23',
    paper: '#13202B',
  },
  text: {
    primary: '#E4ECF4',
    secondary: '#B8C4D0',
  },
};

export function buildAppTheme(mode) {
  return createTheme({
    palette: mode === 'dark' ? darkPalette : lightPalette,
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
      h5: {
        fontWeight: 700,
        letterSpacing: 0.4,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(6px)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}
