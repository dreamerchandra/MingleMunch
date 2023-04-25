import {
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { Container } from '@mui/system';
import { useMutationOrderStatus, useOrderHistoryQuery } from './order-query';
import { OrderStatus } from '../../../common/types/Order';

export const IncomingOrder = () => {
  const { data, isLoading } = useOrderHistoryQuery();
  const { mutateAsync } = useMutationOrderStatus();
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
              gap: 2,
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
                  <Typography variant="h6">
                    {order?.userDetails?.name}
                  </Typography>
                  <Typography variant="h6">{order?.orderRefId}</Typography>
                </div>
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
                      mutateAsync({
                        orderId: order.orderId,
                        orderStatus: e.target?.value as OrderStatus
                      });
                    }}
                  >
                    <MenuItem value={'pending'}>Pending</MenuItem>
                    <MenuItem value={'ack_from_hotel'}>Order Ack</MenuItem>
                    <MenuItem value={'prepared'}>Prepared</MenuItem>
                    <MenuItem value={'delivered'}>Delivered</MenuItem>
                  </Select>
                  <Typography variant="caption">₹{order.grandTotal}</Typography>
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
