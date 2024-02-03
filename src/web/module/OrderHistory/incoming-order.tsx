import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { OrderStatus } from '../../../common/types/Order';
import { useMutationOrderStatus, useOrderHistoryQuery } from './order-query';

export const IncomingOrder = () => {
  const { loading, orders } = useOrderHistoryQuery();
  const { mutateAsync } = useMutationOrderStatus();
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
      }}
    >
      {orders?.map((order) => (
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 3,
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
                {item.itemName} *{item.quantity}- {item.shopDetails?.shopName}
              </Typography>
            ))}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};
