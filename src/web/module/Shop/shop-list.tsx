import PlayArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useShopQuery } from './shop-query';
import { FC } from 'react';
import { Shop as IShop } from '../../../common/types/shop';
import { useNavigate } from 'react-router-dom';

export const Shop: FC<{ shop: IShop }> = ({ shop }) => {
  const navigation = useNavigate();
  return (
    <Card
      sx={{ display: 'flex', justifyContent: 'space-between' }}
      onClick={() => {
        navigation(`/shop/${shop.shopId}`);
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto', m: 2 }}>
          <Typography component="div" variant="h3">
            {shop.shopName}
          </Typography>
          <Typography component="div" variant="caption">
            Delivery Fee: Rs.30
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
          <IconButton aria-label="play/pause">
            <PlayArrowIcon sx={{ height: 38, width: 38 }} />
          </IconButton>
        </Box>
      </Box>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={shop.shopImage}
        alt={shop.shopName}
      />
    </Card>
  );
};

export const Shops = () => {
  const { data, isLoading } = useShopQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log(data);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: '1rem'
      }}
    >
      {data?.map((shop) => (
        <Shop key={shop.shopId} shop={shop} />
      ))}
    </div>
  );
};
