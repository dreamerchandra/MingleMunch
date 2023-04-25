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

const ProductItem: FC<{ product: Product }> = ({ product }) => {
  const { itemDescription, itemImage, itemName, itemPrice } = product;
  const { addToCart, removeFromCart, cartDetails } = useCart();
  const inCart = cartDetails.cart.filter(
    (item) => item.itemId === product.itemId
  );
  return (
    <CardWrapper>
      <CardMedia
        component="img"
        alt={itemDescription}
        image={itemImage}
        style={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography
          gutterBottom
          variant="h4"
          component="h2"
          className="heading"
        >
          {itemName}
        </Typography>
        <Description variant="body1">{itemDescription}</Description>
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
    </CardWrapper>
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
