import { Add as AddIcon, Remove } from '@mui/icons-material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SwipeableDrawer,
  Typography
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Analytics } from '../../common/analytics';
import { useMutationHomeOrder } from './Shoping/checkout-query';
import { useAppConfig } from './appconfig';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../firebase/auth';
import { post } from '../firebase/fetch';

const initialValue = {
  number: 0,
  quantity: 250,
  time: 0,
  date: new Date()
};

const PickOne: FC<{
  label: string;
  options: { label: string; description: string; id: string }[];
  selectedId: string;
  onChanged: (id: string) => void;
}> = ({ label, options, selectedId, onChanged }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
      }}
    >
      <Typography variant="h3" mb={2}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          width: '100%'
        }}
      >
        {options.map((option) => (
          <Button
            variant={option.id === selectedId ? 'contained' : 'outlined'}
            color="warning"
            disableElevation
            sx={{
              borderRadius: 0
            }}
            onClick={() => onChanged(option.id)}
            key={option.id}
            fullWidth
          >
            {option.label}
          </Button>
        ))}
      </Box>
      <Typography variant="body1" textAlign="center" width="100%">
        {options.find((option) => option.id === selectedId)?.description}
      </Typography>
    </Box>
  );
};

const Add: FC<{ number: number; setNumber: (number: number) => void }> = ({
  number,
  setNumber
}) => {
  if (number) {
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'end',
          p: 0
        }}
      >
        <Button size="small" onClick={() => setNumber(number - 1)}>
          <Remove color="warning" />
        </Button>
        <Typography variant="h6" color="green">
          {number}
        </Typography>
        <Button
          size="small"
          onClick={() => {
            setNumber(number + 1);
          }}
        >
          <AddIcon color="info" />
        </Button>
      </Container>
    );
  }
  return (
    <Button
      onClick={() => {
        setTimeout(() => {
          setNumber(1);
        }, 100); // little animation
      }}
      variant="outlined"
      sx={{
        borderRadius: '10px',
        fontWeight: '900',
        border: '2px solid #4caf50',
        boxShadow:
          '1px 1px 0px 0px, 1px 1px 0px 0px, 1px 1px 0px 0px, 2px 2px 0px 0px, 2px 2px 0px 0px',
        position: 'relative',
        ':active': {
          boxShadow: '0px 0px 0px 0px',
          top: '5px',
          left: '5px'
        }
      }}
      disableRipple
    >
      <AddIcon />
      ADD
    </Button>
  );
};

const isMorning = (now: Date) => {

  // Extract hours and minutes
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Define morning cutoff time (11:30 AM)
  const morningCutoffHour = 11;
  const morningCutoffMinute = 30;

  // Check if it's morning
  if (
    hours < morningCutoffHour ||
    (hours === morningCutoffHour && minutes <= morningCutoffMinute)
  ) {
    return true;
  } else {
    return false;
  }
};

const isEvening = (now: Date) => {
  // Extract hours and minutes
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Define evening cutoff time (6:00 PM)
  const eveningCutoffHour = 18;
  const eveningCutoffMinute = 0;

  // Check if it's evening
  if (
    hours < eveningCutoffHour ||
    (hours === eveningCutoffHour && minutes <= eveningCutoffMinute)
  ) {
    return true;
  } else {
    return false;
  }
}


const isEOD = (date: Date) => !(isEvening(date) || isMorning(date));

const Week: FC<{
  value: Date;
  onChange: (date: Date) => void;
  today: Date,
}> = ({ value, onChange, today }) => {
  const week: Date[] = [];
  for (let i = isEOD(today) ? 1: 0; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    if(date.getDate() === 16) {
      continue;
    }
    week.push(date);
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        mb: 2,
        overflow: 'auto',
        p: 2
      }}
    >
      {week.map((d) => (
        <Button
          key={d.valueOf()}
          color={d.valueOf() === value.valueOf() ? 'secondary' : 'primary'}
          variant={d.valueOf() === value.valueOf() ? 'contained' : 'text'}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            gap: d.valueOf() === value.valueOf() ? 2 : 1,
            borderRadius: '10px',
            boxShadow: '0px 0px 10px 0px #151B331f'
          }}
          onClick={() => onChange(d)}
        >
          <Typography variant="h6" fontWeight={700}>
            {d.toLocaleDateString('default', {
              month: '2-digit',
              day: '2-digit'
            })}
          </Typography>
          <Typography variant="caption" fontWeight={700}>
            {d.getDate() === today.getDate() ? 'Today': d.toLocaleString('default', { weekday: 'short' })}
          </Typography>
        </Button>
      ))}
    </Box>
  );
};
export const HomeFoodDrawer: FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const [today, setToday] = useState(new Date())
  useEffect(() => {
    post('/v1/today', {}, false).then((res) => {
      console.log(res.date, 'today')
      setToday(new Date(res.date));
    })
  }, [])
  const [data, setData] = useState(initialValue);
  const grandTotal =
    data.quantity === 500 ? 298 * data.number : 148 * data.number;
  const { data: appConfig } = useAppConfig();
  const { mutate, isLoading } = useMutationHomeOrder();
  const [success, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const {
    userDetails: { user }
  } = useUser();
  const navigate = useNavigate();
  const onPlaceOrder = () => {
    mutate(
      {
        number: data.number,
        quantity: data.quantity,
        timeSlot: data.time.toString(),
        date: data.date
      },
      {
        onSuccess: () => {
          if ('navigator' in window && 'vibrate' in navigator) {
            navigator.vibrate(200);
          }
          Analytics.pushEvent('home-order-placed', {
            productCategory: 'Food',
            revenue: grandTotal
          });
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
          }, 7_000);
        },
        onError: (err) => {
          setError(
            err.cause?.message ??
              'Something went wrong. Please try again later.'
          );
        }
      }
    );
  };
  useEffect(() => {
    if (!open) {
      return;
    }
    if (!user?.uid) {
      navigate('/login');
    }
    Analytics.pushEvent('home-food-drawer-opened');
    setData(initialValue);
    setShowSuccess(false);
    setError('');
  }, [navigate, open, user?.uid]);
  return (
    <SwipeableDrawer
      open={open}
      anchor="bottom"
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
    >
      {success ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            py: 16,
            background: 'url(abstract_emoji.png) no-repeat center',
            backgroundSize: 'cover',
            width: 'min(100vw, 1000px)',
            margin: 'auto'
          }}
        >
          <Alert variant="filled" color="success">
            Order Placed Successfully
          </Alert>
        </Box>
      ) : (
        <Box
          sx={{
            height: '100%',
            backgroundColor: '#f5f5f5',
            p: 2,
            width: 'min(100vw, 1000px)',
            margin: 'auto'
          }}
        >
          <Typography variant="h3" mb={3}>
            Home Cooked
          </Typography>
          <Alert
            variant="outlined"
            color="warning"
            sx={{
              mb: 3
            }}
            icon={false}
          >
            Order Within
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pl: 2
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                11:30AM Lunch{' '}
                <Typography
                  variant="body1"
                  sx={{
                    display: 'inline'
                  }}
                >
                  (Slot 1)
                </Typography>
              </Typography>
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                6:30PM Dinner{' '}
                <Typography
                  variant="body1"
                  sx={{
                    display: 'inline'
                  }}
                >
                  (Slot 2)
                </Typography>
              </Typography>
            </Box>
          </Alert>
          <Week
            value={data.date}
            onChange={(d) => {
              setData({ ...data, date: d });
            }}
            today={today}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              justifyContent: 'start',
              mb: 8,
              gap: 4
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
                backgroundColor: '#fff',
                p: 2,
                borderRadius: '10px',
                boxShadow: '0px 0px 10px 0px #151B331f'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  justifyContent: 'start'
                }}
              >
                <Typography variant="h3" pl={3} mb={1}>
                  Chicken Chukka
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="Quantity">Quantity</InputLabel>
                  <Select
                    labelId="select-quantity"
                    id="quantity"
                    label="Quantity"
                    value={data.quantity}
                    onChange={(e) =>
                      setData({ ...data, quantity: Number(e.target.value) })
                    }
                  >
                    <MenuItem value={500}>500 gms (Serves 5-6)</MenuItem>
                    <MenuItem value={250}>250 gms (Serves 2-3)</MenuItem>
                  </Select>
                </FormControl>
                {data.quantity === 500 ? (
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    width="100%"
                    textAlign="center"
                  >
                    Rs. 298
                  </Typography>
                ) : (
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    width="100%"
                    textAlign="center"
                  >
                    Rs. 148
                  </Typography>
                )}
              </div>

              <Add
                number={data.number}
                setNumber={(n) => {
                  setData({ ...data, number: n });
                }}
              />
            </Box>
            {data.number ? (
              <div
                style={{
                  placeSelf: 'center'
                }}
              >
                <PickOne
                  label="TimeSlot"
                  onChanged={(time) => {
                    setData({ ...data, time: Number(time) });
                  }}
                  options={
                    !isMorning(today) && data.date.getDate() === today.getDate()
                      ? [
                          {
                            description: 'Delivered By 8: 30PM',
                            id: '1',
                            label: 'Dinner'
                          }
                        ]
                      : [
                          {
                            description: 'Delivered By 1: 30PM',
                            id: '0',
                            label: 'Lunch'
                          },
                          {
                            description: 'Delivered By 8: 30PM',
                            id: '1',
                            label: 'Dinner'
                          }
                        ]
                  }
                  selectedId={data.time.toString()}
                />
              </div>
            ) : null}
            {error ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}
              >
                <Alert variant="filled" color="error">
                  {error}
                </Alert>
                <Button href="tel:+918754791569" color="warning">
                  Call Customer Care
                </Button>
              </Box>
            ) : (
              <LoadingButton
                loading={isLoading}
                loadingPosition="start"
                startIcon={<ShoppingCartCheckoutIcon />}
                variant="contained"
                disabled={data.number ? isLoading || !appConfig?.isOpen : true}
                onClick={onPlaceOrder}
                color="secondary"
                disableElevation
                fullWidth
              >
                {appConfig?.isOpen
                  ? `Place order ₹ ${grandTotal}`
                  : appConfig?.closeReason}
              </LoadingButton>
            )}
          </Box>
        </Box>
      )}
    </SwipeableDrawer>
  );
};
