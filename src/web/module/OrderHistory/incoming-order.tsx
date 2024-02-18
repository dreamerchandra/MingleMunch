import { Box, Drawer } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { OrderStatus } from '../../../common/types/Order';
import { Product } from '../../../common/types/Product';
import { useCart } from '../Shoping/cart-activity';
import { useMutationOrderStatus, useOrderHistoryQuery } from './order-query';
import { useState } from 'react';
import { updateCongestion } from '../../firebase/order';

// const internalOrder = [
//   '8754791569',
//   '8220080109',
//   '+911231231230',
//   '+911234512345'
// ];

const addAllToCart = async (
  itemToQuantity: Record<string, number>,
  addToCart: (product: Product, quanitty: number) => void,
  items: Product[]
) => {
  items.forEach((item) => {
    addToCart(item, itemToQuantity[item.itemId]);
  });
  return;
};

export const IncomingOrder = () => {
  const { loading, orders } = useOrderHistoryQuery();
  const { mutateAsync } = useMutationOrderStatus();
  const { addMultipleToCart, removeAll, updateCartId } = useCart();
  const navigate = useNavigate();
  const [showCongestion, setShowCongestion] = useState('');
  const onCongestion = async (congestion: number) => {
    await updateCongestion({ orderId: showCongestion, congestion });
    setShowCongestion('');
  };
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Container
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 2,
        height: 'calc(100dvh - 140px)',
        overflow: 'auto'
      }}
    >
      History
      {orders?.map((order) => (
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 3,
            flexShrink: 0
          }}
          key={order.orderId}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
              backgroundColor:
                order.status !== 'delivered' ? 'rgb(255 0 0 / 50%)' : ''
            }}
          >
            <Container
              component="div"
              style={{
                padding: 0
              }}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                padding: 0
              }}
            >
              <Container
                component="div"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  border: '1px solid rgb(213 230 213 / 50%)',
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: 1,
                  alignItems: 'center'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Typography variant="h6">{order?.user?.name}</Typography>
                  <Typography variant="caption">
                    Grand Total ₹. {order.bill.grandTotal}
                  </Typography>
                  <Typography variant="caption">
                    Their Bill ₹. {order.bill.costPriceSubTotal}
                  </Typography>
                </Box>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={order.status}
                    label="Order Status"
                    onChange={(e) => {
                      if (e.target.value === 'picked_up') {
                        setShowCongestion(order.orderId);
                      }
                      mutateAsync({
                        orderId: order.orderId,
                        orderStatus: e.target?.value as OrderStatus
                      });
                    }}
                  >
                    <MenuItem value={'pending'}>Pending</MenuItem>
                    <MenuItem value={'ack_from_hotel'}>Order Ack</MenuItem>
                    <MenuItem value={'prepared'}>Prepared</MenuItem>
                    <MenuItem value={'picked_up'}>Picked Up</MenuItem>
                    <MenuItem value={'delivered'}>Delivered</MenuItem>
                  </Select>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={async () => {
                      removeAll();
                      updateCartId(order.orderId);
                      await addAllToCart(
                        Object.keys(order.itemToQuantity).reduce(
                          (acc, id) => ({
                            ...acc,
                            [id]: order.itemToQuantity[id]
                          }),
                          {} as Record<string, number>
                        ),
                        addMultipleToCart,
                        order.items
                      );
                      setTimeout(() => {
                        navigate('/cart');
                      }, 10);
                    }}
                  >
                    Cart
                  </Button>
                </div>
              </Container>
            </Container>
            <Typography variant="caption">
              {new Date(order.createdAt.seconds * 1000).toLocaleString(
                'en-IN',
                {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                }
              )}
            </Typography>
            {order.items.map((item) => (
              <Typography variant="h6" key={item.itemId}>
                {item.itemName} *{order.itemToQuantity[item.itemId]}-{' '}
                {item.shopDetails?.shopName}
              </Typography>
            ))}
          </CardContent>
        </Card>
      ))}
      <Drawer open={Boolean(showCongestion)} anchor="bottom">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2
          }}
        >
          <Typography variant="h6">How congested was the hotel?</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => onCongestion(1)}
            >
              Not at all
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => onCongestion(2)}
            >
              Little
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              color="warning"
              onClick={() => onCongestion(3)}
            >
              Moderate
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => onCongestion(4)}
            >
              High
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => onCongestion(5)}
            >
              Very High
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Container>
  );
};
