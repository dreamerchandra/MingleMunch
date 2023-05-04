import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { FC, useState } from 'react';
import { Product } from '../../../common/types/Product';
import { useCart } from './cart-activity';
import { useMutationCreateOrder } from './checkout-query';
import { useNavigate } from 'react-router-dom';
import { TAX } from '../../../common/types/constant';
import LoadingButton from '@mui/lab/LoadingButton';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

const StyledProduct = styled('div')<{ error: boolean }>(({ theme, error }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  width: '100%',
  margin: theme.spacing(1, 0),
  '> *': {
    color: error ? theme.palette.error.main : ''
  }
}));

const TotalWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(8),
  width: '100%',
  marginTop: theme.spacing(2)
}));

export const Checkout: FC<{ open: boolean }> = ({ open }) => {
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
  const { mutate, isLoading } = useMutationCreateOrder();
  const [success, setShowSuccess] = useState(false);
  const initialErrorState = { message: '', products: [] as string[] };
  const [error, setError] = useState(initialErrorState);
  const navigator = useNavigate();
  const onPlaceOrder = () => {
    mutate(
      {
        details: items.map((item) => ({
          itemId: item.product.itemId,
          quantity: item.quantity
        }))
      },
      {
        onSuccess: (result) => {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            removeAll();
            navigator(`/payments`, {
              state: {
                amount: result.grandTotal,
                orderRefId: result.orderRefId,
                paymentLink: result.paymentLink
              }
            });
          }, 500);
        },
        onError: (err) => {
          setError({
            message: err.cause.message,
            products: err.cause.products.map((product) => product.itemId)
          });
        }
      }
    );
  };
  if (!open) {
    return null;
  }
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
      {error.message ? (
        <Alert
          severity="error"
          onClose={() => {
            removeAll();
            setError(initialErrorState);
          }}
        >
          {error.message}
        </Alert>
      ) : (
        <LoadingButton
          loading={isLoading}
          loadingPosition="start"
          startIcon={<ShoppingCartCheckoutIcon />}
          variant="outlined"
          disabled={isLoading}
          color="primary"
          onClick={onPlaceOrder}
        >
          Place order ₹ {grandTotal}
        </LoadingButton>
      )}
      {success ? (
        <Alert severity="success">
          Order placed successfully. To Complete payment in the next page.
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
            <StyledProduct
              key={item.product.itemId}
              error={error.products.includes(item.product.itemId)}
            >
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
