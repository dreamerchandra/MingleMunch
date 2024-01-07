import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
  styled
} from '@mui/material';
import { useMutationProductEdit, useProductQuery } from './product-query';
import { Product } from '../../../common/types/Product';
import { FC, useMemo } from 'react';
import { useCart } from '../Shoping/cart-activity';
import Grid from '@mui/material/Grid';
import { useUser } from '../../firebase/auth';
import Container from '@mui/material/Container';
import LoadingButton from '@mui/lab/LoadingButton';
import AddToCart from '@mui/icons-material/AddShoppingCart';
import Fuse from 'fuse.js';

const CardActionsWrapper = styled(CardActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 16px;
`;

const CardWrapper = styled(Card)`
  width: 345px;
  min-height: 300px;
  max-height: 370px;
  margin: 10px;
  position: relative;
  img {
    filter: brightness(50%);
    height: 60%;
  }
  .heading {
    position: absolute;
    bottom: 140px;
    font-weight: 700;
    color: #bae967;
  }
`;

const Description = styled(Typography)`
  overflow: hidden;
  box-orient: vertical;
  line-clamp: 3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

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
          {role === 'vendor' ? (
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
            <Button size="small" onClick={() => addToCart(product)}>
              Add to cart
            </Button>
          )}
        </Container>
      )}
    </>
  );
};

const ProductItem: FC<{ product: Product }> = ({ product }) => {
  const { itemDescription, itemImage, itemName, itemPrice } = product;

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
        <div>
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
        <div>
          <CardMedia
            component="img"
            alt={itemDescription}
            image={itemImage}
            style={{ objectFit: 'cover', height: '100px', width: '200px' }}
          />
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
  const { data, isLoading } = useProductQuery({
    search: '',
    isAvailable: role === 'user' ? true : undefined,
    isEnabled: !loading,
    shopId
  });
  const filteredList = useMemo(() => {
    if (data == null) return [];
    if(search == '') return data;
    const fuse = new Fuse(data, fuseOptions);
    return fuse.search(search).map((item) => item.item);
  }, [data, search]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid
      container
      rowGap={3}
      columnGap={{ xs: 2, sm: 3, md: 3 }}
      columns={{ xs: 12, sm: 6, md: 4 }}
      sx={{ marginTop: 4, paddingBottom: 12 }}
    >
      {filteredList?.map((product) => (
        <ProductItem product={product} key={product.itemId} />
      ))}
    </Grid>
  );
};
