import { Box, Button, ButtonGroup, Container, Typography } from '@mui/material';
import { useCart } from './cart-activity';
import { Product } from '../../types/Product';
import { styled } from '@mui/system';
import { FC } from 'react';

const StyledProduct = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  width: '100%'
}));

export const Checkout: FC<{ revealCheckout: () => void }> = ({
  revealCheckout
}) => {
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
      <Button variant="outlined" onClick={revealCheckout}>
        Checkout
      </Button>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
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
      </Box>
    </Container>
  );
};
