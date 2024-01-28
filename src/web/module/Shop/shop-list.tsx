import { Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shop as IShop } from '../../../common/types/shop';
import { useShopQuery } from './shop-query';

export const Shop: FC<{ shop: IShop }> = ({ shop }) => {
  const navigation = useNavigate();
  return (
    <Card
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        minHeight: 100,
        maxHeight: 200,
        height: 'fit-content',
        backgroundColor: '#fff',
        alignItems: 'center',
        minWidth: '85vw',
      }}
      elevation={0}
      onClick={() => {
        navigation(`/shop/${shop.shopId}`);
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', pl: 2 }}>
        <CardContent
          sx={{ flex: '1 0 auto', justifyContent: 'space-between', p: 0 }}
        >
          <Typography component="h3" variant="h3">
            {shop.shopName}
          </Typography>
          <Typography component="h6" variant="h6" color="GrayText">
            {shop.isOpen ? shop.description : 'Currently Closed'}
          </Typography>
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{ width: 75, height: 75, borderRadius: '50%', mr: 3 }}
        image={shop.shopImage}
        alt={shop.shopName}
        style={{
          filter: shop.isOpen ? 'none' : 'grayscale(1)'
        }}
      />
    </Card>
  );
};

export const Shops = () => {
  const { data, isLoading } = useShopQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 4,
        alignItems: 'center',
        gap: 1,
        pb: 16,
      }}
    >
      <Typography variant="h6" sx={{ letterSpacing: 4, mb: 2 }}>
        ALL RESTAURANTS
      </Typography>
      {data?.map((shop) => (
        <div key={shop.shopId}>
          <Shop  shop={shop} />
          <Divider sx={{ width: '75vw', margin: 'auto' }} />
        </div>
      ))}
    </Box>
  );
};
