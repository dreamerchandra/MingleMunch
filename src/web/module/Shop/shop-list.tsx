import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shop as IShop } from '../../../common/types/shop';
import { useAppConfig } from '../appconfig';
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
        width: 'min(90vw, 1000px)',
        borderRadius: '10px',
        pt: 1,
        position: 'relative',
        boxShadow: '0px 0px 5px 0px #0000001f'
      }}
      elevation={0}
      onClick={() => {
        navigation(`/shop/${shop.shopId}`);
      }}
    >
      {shop.tag && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: shop.isOpen ? 'black' : 'red',
            boxShadow: '0px 0px 5px 0px #0000001f',
            p: 0.5
          }}
        >
          <Typography
            variant="caption"
            fontWeight={900}
            className="rainbow_text_animated"
          >
            # {shop.tag}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pl: 2
        }}
      >
        <CardContent
          sx={{
            flex: '1 0 auto',
            justifyContent: 'space-between',
            p: 0,
            pt: shop.tag ? 3 : 0
          }}
        >
          <Typography component="h3" variant="h3">
            {shop.shopName}
          </Typography>
          <Typography component="h6" variant="h6" color="GrayText">
            {shop.isOpen ? shop.description : 'Currently Closed'}
          </Typography>
          {shop.deliveryFee === 0 && (
            <Paper
              sx={{
                background: 'linear-gradient(90deg, #000 10%, #FF8C00 90%)',
                px: 1,
                py: 1,
                color: '#fff',
                borderRadius: '5px',
                fontSize: '13px',
                width: 'fit-content',
                fontWeight: '900'
              }}
            >
              # FREE DELIVERY
            </Paper>
          )}
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
  const { data: appConfig } = useAppConfig();
  const { data, isLoading } = useShopQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        alignItems: 'center',
        gap: 1,
        pb: 16
      }}
    >
      <Box
        sx={{
          mb: 2
        }}
      >
        <Typography variant="h6" sx={{ letterSpacing: 4 }}>
          ALL RESTAURANTS
        </Typography>
        {!appConfig?.isOpen && (
          <Typography variant="h6" color="darkorange" textAlign="center">
            {appConfig?.closeReason}
          </Typography>
        )}
      </Box>

      {data?.map((shop) => (
        <div
          key={shop.shopId}
          style={{
            filter: appConfig?.isOpen ? 'none' : 'grayscale(1)'
          }}
        >
          <Shop shop={shop} />
        </div>
      ))}
    </Box>
  );
};
