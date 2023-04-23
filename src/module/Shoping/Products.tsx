import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography
} from '@mui/material';
import { useProductQuery } from '../../query/products';
import { Product } from '../../types/Product';
import { FC } from 'react';
import { useCart } from './cart-activity';
import Grid from '@mui/material/Grid';

const ProductItem: FC<{ product: Product }> = ({ product }) => {
  const { itemDescription, itemImage, itemName } = product;
  const { addToCart, removeFromCart, cartDetails } = useCart();
  const inCart = cartDetails.cart.filter(
    (item) => item.itemId === product.itemId
  );
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt={itemDescription}
        height="140"
        image={itemImage}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {itemName}
        </Typography>
      </CardContent>
      <CardActions style={{ justifyContent: 'flex-end' }}>
        {inCart.length ? (
          <>
            <Button size="small" onClick={() => removeFromCart(product)}>
              -
            </Button>
            <>{inCart.length}</>
            <Button size="small" onClick={() => addToCart(product)}>
              +
            </Button>
          </>
        ) : (
          <Button size="small" onClick={() => addToCart(product)}>
            Add To Cart
          </Button>
        )}
      </CardActions>
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
    >
      {data?.map((product) => (
        <ProductItem product={product} key={product.itemId} />
      ))}
    </Grid>
  );
};
