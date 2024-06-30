import {
  Alert,
  Box,
  Checkbox,
  Chip,
  Drawer,
  ListItemText
} from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../../../common/types/Order';
import { Product } from '../../../common/types/Product';
import { updateCongestion } from '../../firebase/order';
import { useCart } from '../Shoping/cart-activity';
import { Time } from '../time';
import {
  useMutationOrderStatus,
  useOrderHistoryQuery,
  useMutationOrderAssignee
} from './order-query';
import { SkeletonLoader } from '../loading';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import { usePartnerQuery } from './parner-query';
import { useShopQuery } from '../Shop/shop-query';
import { toast } from 'react-toastify';
import { Shop } from '../../../common/types/shop';
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
  delayReason: [] as string[],
  order: null as Order | null
};

const getBackgroundColor = (order: Order, orders: Order[]): string => {
  const { status } = order;
  const isDuplicate =
    orders
      .filter((o) => !['delivered', 'rejected'].includes(o.status))
      .filter((o) => o.userId === order.userId).length > 1;
  if (status === 'rejected') return '#dedddd';
  if (isDuplicate) return '#e4e27d';
  if (status !== 'delivered') return 'rgb(255 0 0 / 50%)';
  return '';
};

const getDuplicateOrderId = (order: Order, orders: Order[]): string => {
  const duplicate = orders
    .filter((o) => !['delivered', 'rejected'].includes(o.status))
    .filter((o) => o.userId === order.userId);
  if (duplicate.length > 1) {
    return duplicate
      .map((o) => o.orderRefId)
      .filter((v) => v !== order.orderRefId)
      .join(', ');
  }
  return '';
};

const isSameAsOtherOrder = (order: Order, orders: Order[]): boolean => {
  if (order.status === 'rejected') return false;
  if (order.status === 'delivered') return false;
  const duplicate = orders
    .filter((o) => !['delivered', 'rejected'].includes(o.status))
    .filter((o) => o.userId === order.userId)
    .map((o) => o.orderRefId)
    .filter((v) => v !== order.orderRefId);
  const duplicateOrderValue = orders.find((o) => o.orderRefId === duplicate[0])
    ?.bill.grandTotal;
  return duplicateOrderValue === order.bill.grandTotal;
};

export const IncomingOrder = () => {
  const { loading, orders, newlyAdded } = useOrderHistoryQuery();
  const { mutateAsync } = useMutationOrderStatus();
  const { data: shops } = useShopQuery();
  const { mutateAsync: mutateAssignee } = useMutationOrderAssignee();
  const { data: partner } = usePartnerQuery();
  const { addMultipleToCart, removeAll, updateCartId, updateCoupon } =
    useCart();
  const navigate = useNavigate();
  const [assigneeOrder, setAssigneeOrder] = useState<{
    show: boolean;
    order: Order | null;
  }>({
    show: false,
    order: null
  });
  const [showCongestion, setShowCongestion] = useState(initialCongestion);
  const onCongestion = async (congestion: number) => {
    await updateCongestion({ orderId: showCongestion.orderId, congestion });
    setShowCongestion({
      ...showCongestion,
      congestion: congestion
    });
  };
  const [selectedShops, setSelectedShop] = useState<string[]>();
  if (loading) {
    return <SkeletonLoader />;
  }
  const getShopName = (shopId: string, order: Order) => {
    return order.shops?.find((s) => s.shopId === shopId)?.shopName ?? 'Their';
  };
  const isShopSelected = (o: Order): string | true | undefined => {
    if (!selectedShops) {
      return true;
    }
    if (selectedShops?.length === 0) {
      return true;
    }
    return selectedShops?.find((selected) =>
      o.shops?.find((s) => s.shopId === selected)
    );
  };
  const uniqueShops = [...new Set(orders.map(o => o.shops.map(s => s.shopId)).flat())].map(s => shops?.find(shop => shop.shopId === s)).filter(Boolean) as Shop[];
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          width: '100%',
          overflow: 'auto',
          pl: 2,
          pb: 1
        }}
      >
        {uniqueShops?.map((shop) => (
          <Chip
            color="info"
            variant={
              selectedShops?.includes(shop.shopId) ? 'filled' : 'outlined'
            }
            onClick={() => {
              setSelectedShop((prev) => {
                if (prev?.includes(shop.shopId)) {
                  return prev?.filter((s) => s !== shop.shopId);
                }
                return [...(prev ?? []), shop.shopId];
              });
            }}
            label={shop.shopName}
          />
        ))}
      </Box>
      <Container
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: 2,
          height: 'calc(100svh - 170px)',
          overflow: 'auto'
        }}
      >
        History
        <Button
          variant="contained"
          size="small"
          disabled={!partner?.length}
          onClick={async () => {
            const toBeUpdateOrders = orders
              .filter(isShopSelected)
              .filter((o) => !['delivered', 'rejected'].includes(o.status))
              .filter((o) => !o.paymentCollector);
            const rithesh = partner!.find(
              (p) =>
                p.role === 'distributor' &&
                p.userId === 'ZK0ywfvAdQNvKUo19zliKjh6Nqo2'
            );
            if (rithesh && toBeUpdateOrders.length) {
              await Promise.all(
                toBeUpdateOrders.map((o) =>
                  mutateAssignee({
                    paymentCollector: rithesh.userId,
                    paymentCollectorName: rithesh.name,
                    orderId: o.orderId,
                    assignedTo: o.assignedTo ?? [],
                    assigneeName: o.assigneeName ?? ''
                  })
                )
              );
              toast.success('Assigned to Rithesh');
            }else {
              toast.error('Nothing to assign');
            }
          }}
        >
          Auto Assign to Rithesh
        </Button>
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
        {orders?.filter(isShopSelected)?.map((order) => (
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
                backgroundColor: getBackgroundColor(order, orders)
              }}
            >
              <Typography variant="body2">
                Order Id. {order.orderRefId}
              </Typography>
              {getDuplicateOrderId(order, orders) ? (
                <Typography variant="caption">
                  Duplicate Order Id. {getDuplicateOrderId(order, orders)}
                </Typography>
              ) : null}
              {isSameAsOtherOrder(order, orders) ? (
                <Alert variant="filled" severity="error">
                  Same as other order
                </Alert>
              ) : null}
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
                    <Typography variant="h4">
                      Total ₹. {order.bill.grandTotal}
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
                          order: order
                        });
                      }}
                      sx={{
                        fontSize: '12px'
                      }}
                    >
                      <MenuItem value={'pending'}>Pending</MenuItem>
                      <MenuItem
                        value={'rejected'}
                        sx={{
                          color: 'red'
                        }}
                      >
                        Rejected
                      </MenuItem>
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
                        updateCoupon(order.appliedCoupon);
                        await addAllToCart(
                          Object.keys(order.itemToQuantity).reduce(
                            (acc, id) => ({
                              ...acc,
                              [id]: order.itemToQuantity[id]
                            }),
                            {} as Record<string, number>
                          ),
                          addMultipleToCart,
                          order.items.map((i) => {
                            return {
                              ...i,
                              parentItemId: order.details?.find(
                                (d) => d.itemId === i.itemId
                              )?.parentItemId
                            };
                          })
                        );
                        setTimeout(() => {
                          navigate('/cart');
                        }, 10);
                      }}
                    >
                      Cart
                    </Button>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2
                      }}
                    >
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
                      <Button
                        sx={{
                          mt: 1
                        }}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setAssigneeOrder({
                            show: true,
                            order
                          });
                        }}
                      >
                        Assign To
                      </Button>
                    </Box>
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
              {order.items
                .filter((i) => {
                  if (!order.details) {
                    return true;
                  }
                  const details = order.details.find(
                    (d) => d.itemId === i.itemId
                  );
                  return !details?.parentItemId;
                })
                .map((item) => {
                  return (
                    <>
                      <Typography variant="h6" key={item.itemId}>
                        {item.itemName} *{order.itemToQuantity[item.itemId]}-{' '}
                        {item.shopDetails?.shopName}
                      </Typography>
                      {order.items
                        .filter((i) => {
                          if (!order.details) {
                            return false;
                          }
                          const details = order.details.find(
                            (d) => d.itemId === i.itemId
                          );
                          return details?.parentItemId === item.itemId;
                        })
                        .map((subItem) => (
                          <Typography
                            variant="caption"
                            sx={{
                              pl: 2
                            }}
                            key={subItem.itemId}
                          >
                            {subItem.itemName} *
                            {order.itemToQuantity[subItem.itemId]}
                          </Typography>
                        ))}
                    </>
                  );
                })}
            </CardContent>
          </Card>
        ))}
        <OrderStatusDrawer
          showCongestion={showCongestion}
          setShowCongestion={setShowCongestion}
          onCongestion={onCongestion}
          mutateAsync={mutateAsync}
        />
        <AssigneeDrawer
          order={assigneeOrder.order}
          onSave={(
            assignee,
            paymentCollector,
            assigneeName,
            paymentCollectorName
          ) => {
            if (assigneeOrder.order) {
              mutateAssignee({
                assignedTo: assignee,
                orderId: assigneeOrder.order.orderId,
                paymentCollector,
                assigneeName,
                paymentCollectorName
              });
              setAssigneeOrder({
                show: false,
                order: null
              });
            }
          }}
          onClose={() => {
            setAssigneeOrder({
              show: false,
              order: null
            });
          }}
        />
      </Container>
    </>
  );
};

const AssigneeDrawer: FC<{
  order: Order | null;
  onSave: (
    assignee: string[],
    paymentCollector: string,
    assigneeName: string,
    paymentCollectorName: string
  ) => void;
  onClose: () => void;
}> = ({ order, onSave, onClose }) => {
  const { data } = usePartnerQuery();
  const [selected, setSelected] = useState(order?.assignedTo ?? []);
  const [paymentCollector, setPaymentCollector] = useState(
    order?.paymentCollector ?? ''
  );
  const [paymentCollectorName, setPaymentCollectorName] = useState(
    order?.paymentCollectorName ?? ''
  );
  const [assigneeName, setAssigneeName] = useState(order?.assigneeName ?? '');
  useEffect(() => {
    setSelected(order?.assignedTo ?? []);
    setAssigneeName(order?.assigneeName ?? '');
  }, [order?.assignedTo, order?.assigneeName]);
  useEffect(() => {
    setPaymentCollector(order?.paymentCollector ?? '');
    setPaymentCollectorName(order?.paymentCollectorName ?? '');
  }, [order?.paymentCollector, order?.paymentCollectorName]);
  return (
    <Drawer open={!!order} anchor="bottom">
      <FormControl sx={{ m: 1, minWidth: 120, pb: 4 }}>
        <InputLabel htmlFor="delivery-select">Delivery</InputLabel>
        <Select
          label="Delivery"
          value={selected}
          id="delivery-select"
          multiple
          onChange={(e) => {
            setSelected(e.target.value as string[]);
            const name = data?.find(
              (d) => d.userId === e.target.value[0]
            )?.name;
            setAssigneeName(name ?? '');
          }}
          renderValue={(selected) =>
            selected
              .map((s) => data?.find((d) => d.userId === s)?.name)
              .join(', ')
          }
        >
          <ListSubheader>Delivery</ListSubheader>
          {data
            ?.filter((d) => d.role === 'delivery')
            .map((d) => (
              <MenuItem value={d.userId} key={d.userId}>
                <Checkbox checked={selected.includes(d.userId)} />
                <ListItemText primary={d.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel htmlFor="Distributor-select">Payment Collector</InputLabel>
        <Select
          label="Distributor"
          id="Distributor-select"
          value={paymentCollector}
          onChange={(e) => {
            setPaymentCollector(e.target.value);
            console.log(e.target.value);
            const name = data?.find((d) => d.userId === e.target.value)?.name;
            setPaymentCollectorName(name ?? '');
          }}
          renderValue={(selected) =>
            data?.find((d) => d.userId === selected)?.name
          }
        >
          <ListSubheader>Payment Collector</ListSubheader>
          {data
            ?.filter((d) => d.role === 'distributor')
            .map((d) => (
              <MenuItem value={d.userId} key={d.userId}>
                <Checkbox checked={paymentCollector === d.userId} />
                <ListItemText primary={d.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          p: 2
        }}
      >
        <Button
          variant="text"
          fullWidth
          onClick={() => {
            onClose();
            setSelected([]);
            setPaymentCollectorName('');
            setPaymentCollector('');
            setAssigneeName('');
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={() => {
            onSave(
              selected,
              paymentCollector,
              assigneeName,
              paymentCollectorName
            );
            setSelected([]);
            setPaymentCollectorName('');
            setPaymentCollector('');
            setAssigneeName('');
          }}
        >
          Save
        </Button>
      </Box>
    </Drawer>
  );
};

function OrderStatusDrawer({
  showCongestion,
  setShowCongestion,
  onCongestion,
  mutateAsync
}: {
  showCongestion: typeof initialCongestion;
  setShowCongestion: (value: typeof initialCongestion) => void;
  onCongestion: (congestion: number) => void;
  mutateAsync: (data: {
    orderId: string;
    orderStatus: OrderStatus;
    time: Date;
    delayReason: string[];
    orderAmount: number;
  }) => Promise<void>;
}) {
  return (
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
        <Typography variant="h3">Update for {showCongestion.status}</Typography>
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
              {['Bill Pay', 'Packing Mistake', 'Delivery Guy Late'].map((s) => (
                <MenuItem value={s}>
                  <Checkbox checked={showCongestion.delayReason.includes(s)} />
                  <ListItemText primary={s} />
                </MenuItem>
              ))}
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
                  <Checkbox checked={showCongestion.delayReason.includes(s)} />
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
  );
}
