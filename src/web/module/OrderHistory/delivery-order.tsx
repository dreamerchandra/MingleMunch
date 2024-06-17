import { Alert, Box, Checkbox, Drawer, ListItemText } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from 'react';
import { Order, OrderStatus } from '../../../common/types/Order';
import { updateCongestion } from '../../firebase/order';
import { SkeletonLoader } from '../loading';
import { Time } from '../time';
import { useMutationOrderStatus, useOrderHistoryQuery } from './order-query';
import { useDistributorPaymentQuery } from './parner-query';
import { useUser } from '../../firebase/auth';

// const internalOrder = [
//   '8754791569',
//   '8220080109',
//   '+911231231230',
//   '+911234512345'
// ];

const initialCongestion = {
  orderId: '',
  congestion: 0,
  time: null as Date | null,
  status: null as OrderStatus | null,
  delayReason: [] as string[],
  order: null as Order | null
};

const getBackgroundColor = (status: OrderStatus): string => {
  if (status === 'rejected') return '#dedddd';
  if (status !== 'delivered') return 'rgb(255 0 0 / 50%)';
  return '';
};

const getPaymentContext = (order: Order, myId: string) => {
  if (order.assignedTo) {
    if (order.assignedTo?.includes(myId)) {
      if (order.assignedTo.includes(order.paymentCollector)) {
        return 'Delivery and get payment from customer';
      }
      if (!order.paymentCollector) {
        return 'Customer Already paid. Just Deliver';
      }
      if(order.paymentCollector !== myId && order.assignedTo.includes(myId)) {
        return `Handover the order to ${order.paymentCollectorName}`
      }
    }
    if (order.paymentCollector === myId) {
      return `Collect order from ${order.assigneeName} and get payment from customer`;
    }
  }
  return 'Collect payment from customer';
};

export const IncomingOrder = () => {
  const { loading, orders, newlyAdded } = useOrderHistoryQuery();
  const { mutateAsync } = useMutationOrderStatus();
  const {
    userDetails: { user }
  } = useUser();
  const { data: pendingPayment } = useDistributorPaymentQuery();
  const [showCongestion, setShowCongestion] = useState(initialCongestion);
  const onCongestion = async (congestion: number) => {
    await updateCongestion({ orderId: showCongestion.orderId, congestion });
    setShowCongestion({
      ...showCongestion,
      congestion: congestion
    });
  };
  if (loading) {
    return <SkeletonLoader />;
  }
  return (
    <Container
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 2,
        height: 'calc(100svh - 120px)',
        overflow: 'auto'
      }}
    >
      History
      {newlyAdded.length ? (
        <Box
          sx={{
            position: 'absolute',
            top: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100
          }}
        >
          <Alert severity="warning">
            {newlyAdded.length} New Order
            <br />
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload
            </Button>
          </Alert>
        </Box>
      ) : null}
      {pendingPayment?.amount && (
        <Typography>Payment Collected: ₹. {pendingPayment?.amount}</Typography>
      )}
      {orders?.map((order) => {
        return (
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
              backgroundColor: getBackgroundColor(order.status)
            }}
          >
            <Typography variant="caption">
              {getPaymentContext(order, user!.uid)}
            </Typography>
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
                  <Typography variant="body2">
                    Order Id. {order.orderRefId}
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
                      if (e.target.value === 'rejected') {
                        mutateAsync({
                          orderId: order.orderId,
                          orderStatus: 'rejected',
                          time: new Date(),
                          delayReason: [],
                          orderAmount: order.bill.grandTotal
                        });
                        return;
                      }
                      const newStatus = e.target.value as OrderStatus;
                      const oldTime = order.timeStamps?.[newStatus]
                        ? (order.timeStamps?.[newStatus].toDate() as Date)
                        : new Date();
                      setShowCongestion({
                        status: newStatus,
                        orderId: order.orderId,
                        congestion: order.congestion || 0,
                        time: oldTime,
                        delayReason: order.delayReason?.[newStatus] ?? [],
                        order
                      });
                    }}
                    sx={{
                      fontSize: '12px'
                    }}
                  >
                    <MenuItem value={'pending'} disabled>
                      Pending
                    </MenuItem>
                    <MenuItem value={'ack_from_hotel'} disabled>
                      Hotel Acknowledged
                    </MenuItem>
                    <MenuItem value={'prepared'}>Prepared</MenuItem>
                    <MenuItem value={'picked_up'}>Out For Delivery</MenuItem>
                    <MenuItem value={'reached_location'}>
                      Reached Customer Place
                    </MenuItem>
                    <MenuItem
                      value={'delivered'}
                      disabled={
                        order.paymentCollector
                          ? order.paymentCollector !== user?.uid
                          : false
                      }
                    >
                      Delivered
                    </MenuItem>
                  </Select>
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
      )})}
      <Drawer
        open={Boolean(showCongestion.orderId)}
        anchor="bottom"
        ModalProps={{
          onBackdropClick: () => {
            setShowCongestion(initialCongestion);
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
              if (
                showCongestion.status &&
                showCongestion.time &&
                showCongestion.order
              ) {
                await mutateAsync({
                  orderId: showCongestion.orderId,
                  orderStatus: showCongestion.status,
                  time: showCongestion.time,
                  delayReason: showCongestion.delayReason,
                  orderAmount: showCongestion.order.bill.grandTotal
                });
              }
              setShowCongestion(initialCongestion);
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
