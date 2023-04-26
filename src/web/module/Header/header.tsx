import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import { FC, useState } from 'react';
import { DrawerProps } from '../type';
import { Container } from '@mui/system';
import { useNavigate } from 'react-router-dom';

export const Header: FC<{ Menu: FC<DrawerProps> }> = ({ Menu }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
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
              style={{ cursor: 'pointer', marginLeft: 0 }}
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
                B-SCHOOL BISTRO
              </Typography>
            </Container>
            {/* <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search> */}
          </Toolbar>
        </AppBar>
      </Box>
      <Menu open={open} setOpen={setOpen} />
    </>
  );
};
