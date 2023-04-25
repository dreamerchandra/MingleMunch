import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Typography
} from '@mui/material';
import { useCart } from './cart-activity';
import { Product } from '../../../common/types/Product';
import { styled } from '@mui/system';
import { FC } from 'react';

const StyledProduct = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  width: '100%'
}));

const TotalWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(8),
  width: '100%',
  marginTop: theme.spacing(2)
}));

const TAX = 0.18;
export const Checkout: FC = () => {
  const { cartDetails, addToCart, removeFromCart } = useCart();
  const items = cartDetails.cart.reduce((old, cartItem) => {
    const item = old.find((item) => item.product.itemId === cartItem.itemId);
    if (item) {
      item.quantity += 1;
    } else {
      old.push({ product: cartItem, quantity: 1 });
    }
    return old;
  }, [] as { product: Product; quantity: number }[]);
  const subTotal = items.reduce(
    (old, item) => old + item.product.itemPrice * item.quantity,
    0
  );
  const tax = Number((subTotal * TAX).toFixed(2));
  const grandTotal = Number((subTotal + tax).toFixed(2));
  //upi://pay?pa=nadanavigneshwarar123@oksbi&pn=Nadana Vigneshwarar&aid=uGICAgMDUjJuDNw
  return (
    <Container
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2
      }}
    >
      <Button
        variant="outlined"
        color="primary"
        href={`upi://pay?pa=nadanavigneshwarar123@oksbi&pn=Nadana Vigneshwarar&aid=uGICAgMDUjJuDNw&am=${grandTotal}&tn=order`}
      >
        Place order ₹ {grandTotal}
      </Button>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: 'calc(40vh - 50px)',
          overflow: 'auto'
        }}
      >
        {items.map((item) => (
          <StyledProduct>
            <div>
              <Typography component="h6">{item.product.itemName}</Typography>
              <Typography component="h6">₹{item.product.itemPrice}</Typography>
            </div>
            <div>
              <ButtonGroup variant="outlined" aria-label="update cart">
                <Button
                  variant="outlined"
                  onClick={() => removeFromCart(item.product)}
                >
                  -
                </Button>
                <Button variant="outlined">{item.quantity}</Button>
                <Button
                  variant="outlined"
                  onClick={() => addToCart(item.product)}
                >
                  +
                </Button>
              </ButtonGroup>
            </div>
          </StyledProduct>
        ))}
        <Divider style={{ width: '40vw', margin: '20px auto' }} />
        <Box
          sx={{
            alignSelf: 'flex-end',
            marginRight: 4
          }}
        >
          <Container
            component="div"
            sx={{
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              width: '100%'
            }}
          >
            <TotalWrapper>
              <Typography component="h6">SubTotal </Typography>
              <Typography component="h6">₹{subTotal}</Typography>
            </TotalWrapper>
            <TotalWrapper>
              <Typography component="h6">Tax </Typography>
              <Typography component="h6">₹{tax}</Typography>
            </TotalWrapper>
            <TotalWrapper>
              <Typography component="h6">GrandTotal </Typography>
              <Typography component="h6">₹{grandTotal}</Typography>
            </TotalWrapper>
          </Container>
        </Box>
      </Box>
    </Container>
  );
};
