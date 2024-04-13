import { ArrowBackRounded, Instagram } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import History from '@mui/icons-material/History';
import Home from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { Button, InputAdornment, TextField, Typography } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled, useTheme } from '@mui/material/styles';
import { FC, ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';

const StyledBottomNavigationAction = styled(BottomNavigationAction)(`
  &.Mui-selected {
    color: #ff0404e2;
  }
`);

export const Header: FC<{
  onSearch?: (search: string) => void;
  search?: string;
  title: string;
  logo?: ReactNode;
}> = ({ onSearch, search, title, logo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchPlaceHolder, setSearchPlaceholder] = useState('');
  useEffect(() => {
    const allPlaceHolders = [
      'Try Mutton Biryani',
      'Try Panner Noodles',
      'Search For Products | Categories',
      'Search For Breads'
    ];
    const intervalId = setInterval(() => {
      setSearchPlaceholder(
        allPlaceHolders[Math.floor(Math.random() * allPlaceHolders.length)]
      );
    }, 2000);
    setSearchPlaceholder(
      allPlaceHolders[Math.floor(Math.random() * allPlaceHolders.length)]
    );
    return () => clearInterval(intervalId);
  }, []);
  const theme = useTheme() as {
    breakpoints: { up: (key: string) => string };
  };

  const { pathname } = useLocation();
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {onSearch ? (
        <Box
          sx={{
            position: 'sticky',
            height: '50px',
            top: 6,
            width: 'min(93vw, 1200px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            [theme.breakpoints.up('sm')]: [{ margin: 'auto' }]
          }}
        >
          <Button
            onClick={() => {
              navigate(-1);
            }}
            sx={{
              borderRadius: '50%',
              height: '55px',
              width: '55px'
            }}
          >
            <ArrowBackRounded />
          </Button>
          <TextField
            size="small"
            id="search"
            variant="outlined"
            fullWidth
            value={search}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck="true"
            onChange={(e) => {
              onSearch && onSearch(e.target.value);
            }}
            sx={{
              position: 'relative',
              boxShadow: '0px 0px 1px 0px #00000050',
              div: {
                py: '4px'
              }
            }}
            placeholder={searchPlaceHolder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment
                  position="end"
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    position: 'absolute',
                    right: 0
                  }}
                  onClick={() => {
                    search && onSearch && onSearch('');
                  }}
                >
                  <CloseIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            top: 0,
            zIndex: 100,
            color: 'white',
            [theme.breakpoints.up('sm')]: [{ margin: 'auto' }],
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0px 1px 0px #00000050',
            height: '60px',
            width: 'min(100vw, 1200px)'
          }}
        >
          {pathname !== '/' ? (
            <>
              <Button
                onClick={() => {
                  navigate(-1);
                }}
                sx={{
                  borderRadius: '50%',
                  height: '55px',
                  width: '55px'
                }}
              >
                <ArrowBackRounded sx={{ p: 0.25 }} />
              </Button>
              <Typography variant="h6" color="text.secondary">
                {title}
              </Typography>
            </>
          ) : logo ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 16px',
                  width: '100%',
                  height: '100%'
                }}
              >
                {logo}
              </div>
              <Button
                onClick={() => {
                  window.open('https://www.instagram.com/burn_delivery/');
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '8px'
                  }}
                >
                  Follow Us
                </Typography>
                <Instagram color="error" />
              </Button>
            </div>
          ) : (
            <Typography variant="h6" sx={{ pl: 4 }} color="text.secondary">
              {title}
            </Typography>
          )}
        </Box>
      )}

      {['/', '/order-history'].includes(location.pathname) && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: 'min(100vw, 1200px)',
            margin: 'auto'
          }}
        >
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(_, newValue) => {
              console.log(newValue);
              navigate(newValue);
            }}
          >
            <StyledBottomNavigationAction
              label="Home"
              value="/"
              icon={<Home />}
            />
            <StyledBottomNavigationAction
              label="Order History"
              value="/order-history"
              icon={<History />}
            />
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
};
