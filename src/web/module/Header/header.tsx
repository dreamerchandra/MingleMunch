import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import { FC, useState } from 'react';
import { DrawerProps } from '../type';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';
import InputBase from '@mui/material/InputBase';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginLeft: 0,
  width: '100%',
  transition: 'width 0.5s',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto'
  }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch'
      }
    }
  }
}));

export const Header: FC<{
  Menu: FC<DrawerProps>;
  onSearch?: (search: string) => void;
}> = ({ Menu, onSearch }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [searchFocus, setSearchFocus] = useState(false);
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar style={{
            width: '100%',
          }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              onClick={() => {
                setOpen(true);
              }}
            >
              <MenuIcon />
            </IconButton>
            <Container
              component="div"
              style={{ cursor: 'pointer', marginLeft: 0, display: searchFocus ? 'none' : 'block' }}
              onClick={() => {
                navigate('/');
              }}
            >
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1 }}
              >
                BURN
              </Typography>
            </Container>
            {onSearch && (
              <Search style={{
                width: searchFocus ? '80vw' : 'auto'
              }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                  onFocus={() => {
                    setSearchFocus(true);
                  }}
                  onBlur={() => {
                    setSearchFocus(false);
                  }}
                  onChange={(e) => {
                    onSearch(e.target.value);
                  }}
                />
              </Search>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Menu open={open} setOpen={setOpen} />
    </>
  );
};
