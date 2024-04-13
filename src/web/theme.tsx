import { ThemeOptions } from '@mui/material';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps
} from 'react-router-dom';
import { LinkProps } from '@mui/material/Link';
import { forwardRef } from 'react';

const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] }
>((props, ref) => {
  const { href, ...other } = props;
  return <RouterLink ref={ref} to={href} {...other} />;
});

export const theme: ThemeOptions = {
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#cfff0424',
        }
      }
    },
    MuiButton: {
      defaultProps: {
        color: 'primary',
        disableRipple: false,
        disableTouchRipple: false,
        disableFocusRipple: false
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior
      }
    },
    MuiLink: {
      defaultProps: {
        component: LinkBehavior
      } as LinkProps
    }
  },
  palette: {
    primary: {
      main: 'rgba(0, 0, 0, 0.87)',
      light: 'rgba(0, 0, 0, 0.87)',
      contrastText: '#9A9A9D'
    },
    secondary: {
      main: '#d1ff04',
      light: '#d1ff04',
      contrastText: '#000'
    },
    divider: 'rgba(0, 0, 0, 0.3)',
    background: {
      default: '#fff',
      paper: '#fff',
    },
    common: {
      black: '#1D1D1D',
      white: '#fff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.8)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.3)'
    },
    
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    }
  },
  typography: {
    fontFamily: "'Nunito', sans-serif ",
    h1: {
      fontFamily: "'Nunito', sans-serif ",
      fontSize: '4.0625rem',
      fontWeight: 900,
      lineHeight: 1.1142857142857143
    },
    h2: {
      fontFamily: "'Nunito', sans-serif ",
      fontSize: '1.75rem',
      fontWeight: 900,
      lineHeight: 1.2222222222222223,
      color: '#151B33'
    },
    h3: {
      fontFamily: "'Nunito', sans-serif ",
      fontSize: '1.375rem',
      fontWeight: 600,
      lineHeight: 1.2222222222222223,
      color: '#151B33'
    },
    h4: {
      fontFamily: "'Nunito', sans-serif ",
      fontSize: '1.125rem',
      lineHeight: 1.2222222222222223,
      letterSpacing: 0.2,
      fontWeight: 700
    },
    h5: {
      fontSize: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: 0.2,
      fontWeight: 100,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    h6: {
      fontSize: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: 0.1,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 200,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.3333333333333333,
      letterSpacing: 0,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: 0,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    caption: {
      display: 'inline-block',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: 0,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    allVariants: {
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    htmlFontSize: 16,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    },
    overline: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      textTransform: 'uppercase',
      scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)'
    }
  }
};
