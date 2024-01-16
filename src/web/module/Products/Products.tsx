import AddToCart from '@mui/icons-material/AddShoppingCart';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Fuse from 'fuse.js';
import { FC, useMemo } from 'react';
import { Product } from '../../../common/types/Product';
import { useUser } from '../../firebase/auth';
import { useShopQuery } from '../Shop/shop-query';
import { useCart } from '../Shoping/cart-activity';
import { useMutationProductEdit, useProductQuery } from './product-query';

const FooterActions: FC<{ product: Product }> = ({ product }) => {
  const { addToCart, removeFromCart, cartDetails } = useCart();
  const {
    userDetails: { role }
  } = useUser();
  const inCart = cartDetails.cart.filter(
    (item) => item.itemId === product.itemId
  );
  const { mutateAsync, isLoading } = useMutationProductEdit();

  return (
    <>
      {inCart.length ? (
        <Container
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'end'
          }}
        >
          <Button size="small" onClick={() => removeFromCart(product)}>
            -
          </Button>
          <>{inCart.length}</>
          <Button size="small" onClick={() => addToCart(product)}>
            +
          </Button>
        </Container>
      ) : (
        <Container
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'end'
          }}
        >
          {['admin', 'vendor'].includes(role) ? (
            <>
              <LoadingButton
                size="small"
                onClick={() =>
                  mutateAsync({
                    productId: product.itemId,
                    isAvailable: !product.isAvailable
                  })
                }
                variant="outlined"
                disabled={isLoading}
                loading={isLoading}
              >
                {product.isAvailable ? 'Can Order' : 'Out of stock'}
              </LoadingButton>

              <IconButton
                aria-label="add to cart"
                color="primary"
                onClick={() => addToCart(product)}
                disabled={!product.isAvailable}
              >
                <AddToCart />
              </IconButton>
            </>
          ) : (
            <Button
              size="small"
              onClick={() => addToCart(product)}
              variant="outlined"
            >
              Add to cart
            </Button>
          )}
        </Container>
      )}
    </>
  );
};

const ProductItem: FC<{ product: Product }> = ({ product }) => {
  const { itemDescription, itemName, itemPrice } = product;

  return (
    <div
      style={{
        width: '80vw',
        margin: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <div style={{ padding: '8px' }}>
          <Typography variant="h3" component="h2">
            {itemName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {itemDescription}
          </Typography>
          <Typography variant="h3" color="text.secondary">
            ₹{itemPrice}
          </Typography>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ height: '25px' }}></div>
          <FooterActions product={product} />
        </div>
      </div>
      <Divider />
    </div>
  );
};

const fuseOptions = {
  shouldSort: true,
  keys: ['itemName', 'itemDescription']
};
export const Products: FC<{ search: string; shopId: string }> = ({
  search,
  shopId
}) => {
  const {
    userDetails: { role, loading }
  } = useUser();
  const {data: shops} = useShopQuery()
  
  const { data, isLoading } = useProductQuery({
    search: '',
    isAvailable: role === 'user' ? true : undefined,
    isEnabled: !loading,
    shopId
  });
  const filteredList = useMemo(() => {
    if (data == null) return [];
    if (search == '') return data;
    const fuse = new Fuse(data, fuseOptions);
    return fuse.search(search).map((item) => item.item);
  }, [data, search]);

  if (isLoading) {
    return <CircularProgress />;
  }
  const shopName =shops?.find((shop) => shop.shopId === shopId)?.shopName ?? 'Loading...';

  return (
    <Grid
      container
      rowGap={3}
      columnGap={{ xs: 2, sm: 3, md: 3 }}
      columns={{ xs: 12, sm: 6, md: 4 }}
      sx={{ marginTop: 4, paddingBottom: 12 }}
    >
      <Typography variant='h2' component='h2' sx={{margin: 'auto'}}>{shopName}</Typography>
      {filteredList?.map((product) => (
        <ProductItem product={product} key={product.itemId} />
      ))}
    </Grid>
  );
};
