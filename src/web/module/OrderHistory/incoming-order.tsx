import { Box, Checkbox, Drawer, ListItemText } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../../../common/types/Order';
import { Product } from '../../../common/types/Product';
import { updateCongestion } from '../../firebase/order';
import { useCart } from '../Shoping/cart-activity';
import { Time } from '../time';
import { useMutationOrderStatus, useOrderHistoryQuery } from './order-query';

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

const initialCongestion = {
  orderId: '',
  congestion: 0,
  time: null as Date | null,
  status: null as OrderStatus | null,
  delayReason: [] as string[]
};

export const IncomingOrder = () => {
  const { loading, orders } = useOrderHistoryQuery();
  const { mutateAsync } = useMutationOrderStatus();
  const { addMultipleToCart, removeAll, updateCartId } = useCart();
  const navigate = useNavigate();
  const [showCongestion, setShowCongestion] = useState(initialCongestion);
  const onCongestion = async (congestion: number) => {
    await updateCongestion({ orderId: showCongestion.orderId, congestion });
    setShowCongestion({
      ...showCongestion,
      congestion: congestion
    });
  };
  if (loading) {
    return <CircularProgress />;
  }
  const getShopName = (shopId: string, order: Order) => {
    return order.shops?.find((s) => s.shopId === shopId)?.shopName ?? 'Their';
  };
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
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6">{order?.user?.name}</Typography>
                  <Typography variant="body2">
                    Grand Total ₹. {order.bill.grandTotal}
                  </Typography>
                  {Object.keys(order.shopOrderValue).map((s) => (
                    <Typography variant="caption">
                      {getShopName(s, order)}: ₹.
                      {order.shopOrderValue[s].costPriceSubTotal +
                        order.shopOrderValue[s].costPriceParcelChargesTotal}
                    </Typography>
                  ))}
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
                      const newStatus = e.target.value as OrderStatus;
                      const oldTime = order.timeStamps?.[newStatus]
                        ? (order.timeStamps?.[newStatus].toDate() as Date)
                        : new Date();
                      setShowCongestion({
                        status: newStatus,
                        orderId: order.orderId,
                        congestion: order.congestion || 0,
                        time: oldTime,
                        delayReason: order.delayReason?.[newStatus] ?? []
                      });
                    }}
                    sx={{
                      fontSize: '12px'
                    }}
                  >
                    <MenuItem value={'pending'}>Pending</MenuItem>
                    <MenuItem value={'ack_from_hotel'}>
                      Hotel Acknowledged
                    </MenuItem>
                    <MenuItem value={'prepared'}>Prepared</MenuItem>
                    <MenuItem value={'picked_up'}>Out For Delivery</MenuItem>
                    <MenuItem value={'reached_location'}>
                      Reached Customer Place
                    </MenuItem>
                    <MenuItem value={'delivered'}>Delivered</MenuItem>
                  </Select>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
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
                  <Button
                    sx={{
                      mt: 1
                    }}
                    variant="text"
                    size="small"
                    href={`tel:${order.user.phone}`}
                  >
                    Call
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
      <Drawer
        open={Boolean(showCongestion.orderId)}
        anchor="bottom"
        ModalProps={{
          onBackdropClick: () => {
            setShowCongestion({
              orderId: '',
              congestion: 0,
              time: null,
              status: null,
              delayReason: []
            });
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2
          }}
        >
          <Typography variant="h3">
            Update for {showCongestion.status}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Typography variant="caption">Pick the time</Typography>
            <Time
              value={showCongestion.time ?? new Date()}
              onChange={async (newValue) => {
                setShowCongestion({
                  ...showCongestion,
                  time: newValue
                });
              }}
            />
          </LocalizationProvider>
          {showCongestion.status === 'picked_up' && (
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
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                {['Not at all', 'Little', 'Moderate', 'High', 'Very High'].map(
                  (c, i) => (
                    <Button
                      variant={
                        showCongestion.congestion === i + 1
                          ? 'contained'
                          : 'outlined'
                      }
                      color={i < 2 ? 'error' : i === 2 ? 'warning' : 'success'}
                      onClick={() => onCongestion(i + 1)}
                    >
                      {c}
                    </Button>
                  )
                )}
              </Box>
            </Box>
          )}
          {showCongestion.status === 'picked_up' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 2
              }}
            >
              <Typography variant="h6">Why was the delay</Typography>
              <Select
                labelId="Order Delay Reason"
                id="delay_reason"
                value={showCongestion.delayReason}
                label="Delay reason"
                multiple
                onChange={(e) => {
                  setShowCongestion({
                    ...showCongestion,
                    delayReason: e.target.value as string[]
                  });
                }}
                renderValue={(selected) => selected.join(', ')}
              >
                {['Bill Pay', 'Packing Mistake', 'Delivery Guy Late'].map(
                  (s) => (
                    <MenuItem value={s}>
                      <Checkbox
                        checked={showCongestion.delayReason.includes(s)}
                      />
                      <ListItemText primary={s} />
                    </MenuItem>
                  )
                )}
              </Select>
            </Box>
          )}
          {showCongestion.status === 'delivered' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 2
              }}
            >
              <Typography variant="h6">Why was the delay</Typography>
              <Select
                labelId="Order Delay Reason"
                id="delay_reason"
                value={showCongestion.delayReason}
                label="Delay reason"
                multiple
                onChange={(e) => {
                  setShowCongestion({
                    ...showCongestion,
                    delayReason: e.target.value as string[]
                  });
                }}
                renderValue={(selected) => selected.join(', ')}
              >
                {['Arrival Delay', 'Payment Delay'].map((s) => (
                  <MenuItem value={s}>
                    <Checkbox
                      checked={showCongestion.delayReason.includes(s)}
                    />
                    <ListItemText primary={s} />
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
          <Button
            onClick={async () => {
              if (showCongestion.status && showCongestion.time) {
                await mutateAsync({
                  orderId: showCongestion.orderId,
                  orderStatus: showCongestion.status,
                  time: showCongestion.time,
                  delayReason: showCongestion.delayReason
                });
              }
              setShowCongestion({
                orderId: '',
                congestion: 0,
                time: null,
                status: null,
                delayReason: []
              });
            }}
            color="info"
          >
            Save
          </Button>
        </Box>
      </Drawer>
    </Container>
  );
};
