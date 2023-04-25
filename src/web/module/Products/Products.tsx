import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
  styled
} from '@mui/material';
import { useProductQuery } from '../../query/products';
import { Product } from '../../../common/types/Product';
import { FC } from 'react';
import { useCart } from '../Shoping/cart-activity';
import Grid from '@mui/material/Grid';

const CardActionsWrapper = styled(CardActions)`
  display: flex;
  justify-content: space-between;
  margin: 0 16px;
`;
const ProductItem: FC<{ product: Product }> = ({ product }) => {
  const { itemDescription, itemImage, itemName, itemPrice } = product;
  const { addToCart, removeFromCart, cartDetails } = useCart();
  const inCart = cartDetails.cart.filter(
    (item) => item.itemId === product.itemId
  );
  return (
    <Card sx={{ width: 345, height: 350 }}>
      <CardMedia
        component="img"
        alt={itemDescription}
        height="140"
        image={itemImage}
        style={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography gutterBottom variant="h4" component="h2">
          {itemName}
        </Typography>
        <Typography gutterBottom variant="body1" component="h3">
          {itemDescription}
        </Typography>
      </CardContent>
      <CardActionsWrapper>
        <Typography gutterBottom component="h3">
          ₹{itemPrice}
        </Typography>
        {inCart.length ? (
          <div>
            <Button size="small" onClick={() => removeFromCart(product)}>
              -
            </Button>
            <>{inCart.length}</>
            <Button size="small" onClick={() => addToCart(product)}>
              +
            </Button>
          </div>
        ) : (
          <Button size="small" onClick={() => addToCart(product)}>
            Add To Cart
          </Button>
        )}
      </CardActionsWrapper>
    </Card>
  );
};

export const Products = () => {
  const { data, isLoading } = useProductQuery();
  if (isLoading) {
    return <CircularProgress />;
  }
  return (
    <Grid
      container
      rowGap={3}
      columnGap={{ xs: 2, sm: 3, md: 3 }}
      columns={{ xs: 12, sm: 6, md: 4 }}
      sx={{ marginTop: 4 }}
    >
      {data?.map((product) => (
        <ProductItem product={product} key={product.itemId} />
      ))}
    </Grid>
  );
};
