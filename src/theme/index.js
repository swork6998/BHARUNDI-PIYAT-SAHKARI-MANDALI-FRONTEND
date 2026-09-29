import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b5e20', // ખેતીવાડી હરિયાળી લીલો રંગ
      light: '#4c8c4a',
      dark: '#003300',
      contrastText: '#ffffff',
      lighter: '#e8f5e9'
    },
    secondary: {
      main: '#c25e00', // સિંચાઈ અને જમીનનો ગરમ કેસરી રંગ
      light: '#fa8e3c',
      dark: '#8c3100',
      contrastText: '#ffffff',
      lighter: '#fff3e0'
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      lighter: '#e8f5e9'
    },
    info: {
      main: '#0277bd',
      light: '#03a9f4',
      lighter: '#e1f5fe'
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      lighter: '#fff3e0'
    },
    error: {
      main: '#c62828',
      light: '#ef5350',
      lighter: '#ffebee'
    },
    background: {
      default: '#f4fbf5',
      paper: '#ffffff'
    },
    text: {
      primary: '#1c2d1d',
      secondary: '#4f6350'
    }
  },
  typography: {
    fontFamily: [
      'GoogleInputToolsGujarati',
      'Noto Sans Gujarati',
      'Shruti',
      'Nirmala UI',
      'sans-serif'
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '8px 10px',
            fontSize: '0.82rem'
          }
        },
        head: {
          fontWeight: 700,
          color: '#1b5e20',
          backgroundColor: '#eef7ef',
          '@media (max-width: 600px)': {
            padding: '10px 10px',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap'
          }
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          maxWidth: '100%'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width: 600px)': {
            margin: '12px',
            width: 'calc(100% - 24px) !important',
            maxWidth: 'calc(100% - 24px) !important'
          }
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '12px',
          paddingRight: '12px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px'
          }
        }
      }
    }
  }
});

export default theme;
