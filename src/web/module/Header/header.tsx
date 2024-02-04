import CloseIcon from '@mui/icons-material/CloseOutlined';
import History from '@mui/icons-material/History';
import Home from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { InputAdornment, TextField } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StyledBottomNavigationAction = styled(BottomNavigationAction)(`
  &.Mui-selected {
    color: #ff0404e2;
  }
`);

export const Header: FC<{
  onSearch?: (search: string) => void;
  search?: string;
}> = ({ onSearch, search }) => {
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
  return (
    <>
      {onSearch ? (
        <Box
          sx={{
            m: 1,
            position: 'sticky',
            height: '74px',
            top: 10,
            width: 'min(96vw, 900px)',
            margin: 'auto'
          }}
        >
          <TextField
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
              boxShadow: '0px 0px 10px 0px #00000050'
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
      ) : null}

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
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
          {/* <StyledBottomNavigationAction
            label="Refer & Earn"
            value="/profile"
            icon={<ShareIcon />}
          /> */}
        </BottomNavigation>
      </Paper>
    </>
  );
};
