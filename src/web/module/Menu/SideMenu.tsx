import { Box, SwipeableDrawer } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { FC, Fragment } from 'react';
import type { DrawerProps } from '../type';
import { History } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const SideMenu: FC<DrawerProps> = ({ open: isOpen, setOpen }) => {
  const close = () => setOpen(false);
  const open = () => setOpen(true);
  const anchor = 'left';
  const navigator = useNavigate();

  return (
    <Fragment key={anchor}>
      <SwipeableDrawer
        anchor={anchor}
        open={isOpen}
        onClose={close}
        onOpen={open}
      >
        <Box
          sx={{
            width: 250
          }}
          role="presentation"
          onClick={close}
          onKeyDown={close}
        >
          <List>
            {[
              {
                label: 'Order History',
                icon: <History />,
                path: '/order-history'
              }
            ].map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigator(item.path);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </SwipeableDrawer>
    </Fragment>
  );
};
