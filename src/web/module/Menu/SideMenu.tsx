import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { Box, SwipeableDrawer } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { FC, Fragment } from 'react';
import type { DrawerProps } from '../type';

export const SideMenu: FC<DrawerProps> = ({ open: isOpen, setOpen }) => {
  const close = () => setOpen(false);
  const open = () => setOpen(true);
  const anchor = 'left';

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
            {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {['All mail', 'Trash', 'Spam'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </Fragment>
  );
};
