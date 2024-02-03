import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { OrderStatus } from '../../../common/types/Order';
import { useOrderHistoryQuery } from './order-query';

const getReadableStatus = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'ack_from_hotel':
      return 'Acknowledged from Hotel';
    case 'prepared':
      return 'Prepared';
    case 'delivered':
      return 'Delivered';
    default:
      return 'Unknown';
  }
};

export const OrderHistory = () => {
  const { orders, loading } = useOrderHistoryQuery();
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Container
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}
    >
      {orders?.length === 0 ? (
        <Box
          sx={{
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Typography variant="h6" color="GrayText">
            You haven't order anything
          </Typography>
          <Typography variant="h6" color="ActiveCaption">
            We will be happy to serve you
          </Typography>
          <Button variant="contained" color="secondary" href="/">
            Order Now
          </Button>
        </Box>
      ) : null}
      {orders?.map((order) => (
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 1,
            p: 0,
            backgroundColor: order.status !== 'delivered' ? '#f1fbeb': '#f5f5f5',
          }}
          key={order.orderId}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              flex: 1,
              width: '100%',
            }}
          >
            <Container
              component="div"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: 0
              }}
            >
              {order.items.map((item) => (
                <Typography variant="h6" key={item.itemId}>
                  {item.itemName} *{item.quantity} - {item.shopDetails?.shopName}
                </Typography>
              ))}
            </Container>
            <Container
              component="div"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                padding: 0
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'primary.main'
                  }}
                >
                  {getReadableStatus(order.status)}
                </Typography>
                <Typography variant="caption">₹{order.grandTotal}</Typography>
                <Typography variant="caption">
                  Ref No {order?.orderRefId?.split('::')[1]}
                </Typography>
              </div>
            </Container>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};
