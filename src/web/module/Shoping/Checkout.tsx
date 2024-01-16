import { Check } from '@mui/icons-material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import LoadingButton from '@mui/lab/LoadingButton';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { FC, useEffect, useState } from 'react';
import { Product } from '../../../common/types/Product';
import { TAX } from '../../../common/types/constant';
import { useCart } from './cart-activity';
import { useMutationCreateOrder } from './checkout-query';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import LogRocket from 'logrocket';

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

const SubSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.spacing(4)
}));

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
  const deliveryFee = 25;
  const grandTotal = Number((subTotal + tax + deliveryFee).toFixed(2));
  const { mutate, isLoading } = useMutationCreateOrder();
  const [success, setShowSuccess] = useState(false);
  const initialErrorState = { message: '', products: [] as string[] };
  const [error, setError] = useState(initialErrorState);
  const onPlaceOrder = () => {
    mutate(
      {
        details: items.map((item) => ({
          itemId: item.product.itemId,
          quantity: item.quantity
        }))
      },
      {
        onSuccess: () => {
          LogRocket.track('order-placed', {
            productCategory: 'Food',
            productSku: items.map((item) => item.product.itemId),
            revenue: grandTotal
          });
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            removeAll();
          }, 10_000);
        },
        onError: (err) => {
          setError({
            message:
              err.cause?.message ??
              'Something went wrong. Please try again later.',
            products:
              err.cause?.products?.map((product) => product.itemId) ?? []
          });
        }
      }
    );
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (items.length === 0) {
      navigate(-1);
    }
  }, [items.length, navigate]);
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
      {success ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#cddfda',
              color: 'white',
              height: '0px',
              width: '0px',
              borderRadius: '50%',
              padding: '125px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 'auto'
            }}
          >
            <Check
              style={{
                width: 60,
                height: 60,
                color: green[900]
              }}
            />
          </div>
          <Alert
            severity="success"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <div>Order placed successfully.</div>
            <div>We will call you shortly to confirm the order.</div>
          </Alert>
        </div>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'space-between',
            height: '90vh'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <SubSection
                style={{
                  marginTop: 0
                }}
              >
                <Alert
                  icon={<CheckIcon fontSize="inherit" />}
                  severity="success"
                  sx={{
                    bgcolor: '#41b594',
                    color: '#fff',
                    borderRadius: '5px'
                  }}
                >
                  You have saved Rs.{Math.round(grandTotal * 0.3)} on this
                  order.
                </Alert>
                <Card
                  sx={{ padding: 2, mt: 2, mb: 2 }}
                  elevation={2}
                  style={{
                    borderRadius: '10px'
                  }}
                >
                  {items
                    .sort((a, b) =>
                      a.product.itemName.localeCompare(b.product.itemName)
                    )
                    .map((item, idx) => (
                      <div key={item.product.itemId}>
                        <StyledProduct
                          key={item.product.itemId}
                          error={error.products.includes(item.product.itemId)}
                        >
                          <div>
                            <Typography component="h6">
                              {item.product.itemName}
                            </Typography>
                            <Typography component="h6">
                              ₹{item.product.itemPrice}
                            </Typography>
                          </div>
                          <div>
                            <ButtonGroup
                              variant="outlined"
                              aria-label="update cart"
                            >
                              <Button
                                variant="outlined"
                                onClick={() => removeFromCart(item.product)}
                              >
                                -
                              </Button>
                              <Button
                                variant="outlined"
                                style={{ maxWidth: '2ch' }}
                              >
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
                        {idx != items.length - 1 && (
                          <Divider
                            style={{
                              backgroundColor: '#f3faf8',
                              margin: 'auto',
                              width: '40vw'
                            }}
                          />
                        )}
                      </div>
                    ))}
                </Card>
              </SubSection>
              <SubSection>
                <Button
                  onClick={() => {
                    navigate(-1);
                  }}
                  sx={{
                    margin: 'auto'
                  }}
                  variant="outlined"
                >
                  <Typography variant="body2">Add more items</Typography>
                </Button>
                <Button
                  onClick={() => {
                    removeAll();
                    navigate('/');
                  }}
                  sx={{
                    margin: 'auto'
                  }}
                  variant="text"
                  color="info"
                >
                  <Typography variant="caption">Clear all</Typography>
                </Button>
              </SubSection>
              <Divider
                style={{ width: '40vw', margin: '20px auto' }}
                sx={{ bgcolor: 'primary.main' }}
              />
            </div>
          </Box>
          <div>
            <Card
              elevation={1}
              style={{
                borderRadius: '5px'
              }}
            >
              <Box
                sx={{
                  alignSelf: 'flex-end'
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
                    <Typography component="h6">Item Total </Typography>
                    <Typography component="h6">₹{subTotal}</Typography>
                  </TotalWrapper>
                  <TotalWrapper>
                    <Typography component="h6">Delivery </Typography>
                    <Typography component="h6">₹ {deliveryFee}</Typography>
                  </TotalWrapper>
                  <TotalWrapper>
                    <Typography component="h6">GrandTotal </Typography>
                    <Typography component="h6">
                      ₹{Math.round(grandTotal)}
                    </Typography>
                  </TotalWrapper>
                </Container>
              </Box>
            </Card>
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
              <SubSection>
                <LoadingButton
                  loading={isLoading}
                  loadingPosition="start"
                  startIcon={<ShoppingCartCheckoutIcon />}
                  variant="contained"
                  disabled={isLoading}
                  color="primary"
                  onClick={onPlaceOrder}
                  style={{
                    borderRadius: '10px',
                    color: '#fff',
                    marginBottom: '20px'
                  }}
                >
                  Place order ₹ {grandTotal}
                </LoadingButton>
              </SubSection>
            )}
          </div>
        </Box>
      )}
    </Container>
  );
};
