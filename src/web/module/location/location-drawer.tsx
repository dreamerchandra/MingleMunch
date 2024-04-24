import { LocationCity, LocationOnRounded } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useCart } from '../Shoping/cart-activity';
import { useLocationQuery } from './use-location-query';

export const LocationDrawer = () => {
  const [open, setOpen] = useState(true);
  const { data: location, isLoading } = useLocationQuery();
  const { cartDetails, updateLocation } = useCart();
  const locationId = cartDetails.locationId;
  useEffect(() => {
    setOpen(!locationId);
  }, [locationId])
  if (locationId) {
    return null;
  }
  if (isLoading) {
    return (
      <Drawer
        anchor={'bottom'}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        sx={{
          zIndex: 10000
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 900,
            bgcolor: 'background.paper',
            m: 'auto'
          }}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Loading..." />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    );
  }
  return (
    <Drawer
      anchor={'bottom'}
      open={open}
      sx={{
        zIndex: 10000
      }}
      
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 900,
          bgcolor: 'background.paper',
          m: 'auto'
        }}
      >
        <nav aria-label="main mailbox folders">
          <List>
            <ListItem disablePadding>
              <ListItemButton disabled>
                <ListItemIcon>
                  <LocationCity />
                </ListItemIcon>
                <ListItemText primary="Select Location" />
              </ListItemButton>
            </ListItem>
          </List>
        </nav>
        <Divider />
        <nav aria-label="secondary mailbox folders">
          <List>
            {location?.map((loc) => (
              <ListItem disablePadding key={loc.id}>
                <ListItemButton
                  onClick={() => {
                    updateLocation(loc.id);
                    setOpen(false);
                  }}
                >
                  <ListItemText primary={loc.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </nav>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          pb: 2,
          gap: 1
        }}
      >
        <LocationOnRounded color="disabled" />
        <Typography variant="caption" color="gray">
          Select the delivery location
        </Typography>
      </Box>
    </Drawer>
  );
};
