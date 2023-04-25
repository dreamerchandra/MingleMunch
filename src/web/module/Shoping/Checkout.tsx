import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Snackbar,
  Typography
} from '@mui/material';
import { margin, styled } from '@mui/system';
import { FC, useState } from 'react';
import { Product } from '../../../common/types/Product';
import { useCart } from './cart-activity';
import { useMutationCreateOrder } from './checkout-query';

const StyledProduct = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  width: '100%',
  margin: theme.spacing(1, 0)
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
  const { cartDetails, addToCart, removeFromCart, removeAll } = useCart();
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
  const { mutateAsync, isLoading } = useMutationCreateOrder();
  const [success, setShowSuccess] = useState(false);
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
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        aria-label="success message"
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          This is a success message!
        </Alert>
      </Snackbar>
      <Button
        disabled={isLoading}
        variant="outlined"
        color="primary"
        onClick={async () => {
          const result = await mutateAsync({
            details: items.map((item) => ({
              itemId: item.product.itemId,
              quantity: item.quantity
            }))
          });
          setShowSuccess(true);
          setTimeout(() => {
            window.open(result.paymentLink);
            setShowSuccess(true);
            removeAll();
          }, 1000);
        }}
      >
        Place order ₹ {grandTotal}
      </Button>
      {success ? (
        <Alert severity="success">
          Order placed successfully. Redirecting to payment page...
        </Alert>
      ) : (
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
            <StyledProduct key={item.product.itemId}>
              <div>
                <Typography component="h6">{item.product.itemName}</Typography>
                <Typography component="h6">
                  ₹{item.product.itemPrice}
                </Typography>
              </div>
              <div>
                <ButtonGroup variant="outlined" aria-label="update cart">
                  <Button
                    variant="outlined"
                    onClick={() => removeFromCart(item.product)}
                  >
                    -
                  </Button>
                  <Button variant="outlined" style={{ maxWidth: '2ch' }}>
                    {item.quantity}
                  </Button>
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
      )}
    </Container>
  );
};
