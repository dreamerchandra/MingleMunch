import { Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { Container } from '@mui/system';
import { useOrderHistoryQuery } from './order-query';
import { OrderStatus } from '../../../common/types/Order';

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
  const { data, isLoading } = useOrderHistoryQuery();
  if (isLoading) {
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
      {data?.map((order) => (
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 3,
            width: 'sm'
          }}
          key={order.orderId}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              width: '100%'
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
                <div>
                  <img
                    style={{
                      width: '100px',
                      height: '100px'
                    }}
                    src="https://images.unsplash.com/photo-1614873636018-548106274e2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2970&q=80"
                  />
                  <Typography variant="body1">
                    {order?.shopDetails?.shopName}
                  </Typography>
                </div>
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
            </Container>
            {order.items.map((item) => (
              <Typography variant="h6" key={item.itemId}>
                {item.itemName} *{item.quantity}
              </Typography>
            ))}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};
