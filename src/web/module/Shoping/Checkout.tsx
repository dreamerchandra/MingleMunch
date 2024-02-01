import { Check, CopyAll, WhatsApp } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import LoadingButton from '@mui/lab/LoadingButton';
import { SwipeableDrawer } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { FC, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '../../../common/analytics';
import { Product } from '../../../common/types/Product';
import { LastOrder } from '../LastOrder/LastOrder';
import { useShopQuery } from '../Shop/shop-query';
import { useAppConfig, useUserConfig } from '../appconfig';
import { useCart } from './cart-activity';
import { useMutationCreateOrder } from './checkout-query';

const StyledProduct = styled('div')<{ error: boolean }>(({ theme, error }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  width: '100%',
  margin: theme.spacing(1, 0),
  '> *': {
    color: error ? theme.palette.error.main : ''
  }
}));

const Background = styled('div')`
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right center;
  width: 75vw;
  top: 0px;
  background-image: url(/shield.png);
  height: 140px;
  position: absolute;
  filter: opacity(0.15);
  right: -55px;
`;

const TotalWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(8),
  width: '100%',
  marginTop: theme.spacing(1)
}));

const SubSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.spacing(2)
}));

export const Checkout: FC = () => {
  const { cartDetails, addToCart, removeFromCart, removeAll } = useCart();
  const { data: shops } = useShopQuery();
  const { data: appConfig } = useAppConfig();
  const { data: userConfig } = useUserConfig();
  const [coupon, _setCoupon] = useState('');
  const [confetti, setConfetti] = useState(false);
  const setCoupon = (coupon: string) => {
    setConfetti(true);
    _setCoupon(coupon);
    Analytics.pushEvent('coupon-applied', { coupon });
  };
  const items = cartDetails.cart.reduce((old, cartItem) => {
    const item = old.find((item) => item.product.itemId === cartItem.itemId);
    if (item) {
      item.quantity += 1;
    } else {
      old.push({ product: cartItem, quantity: 1 });
    }
    return old;
  }, [] as { product: Product; quantity: number }[]);
  const navigate = useNavigate();
  const { mutate, isLoading } = useMutationCreateOrder();
  const [success, setShowSuccess] = useState(false);
  const initialErrorState = { message: '', products: [] as string[] };
  const [error, setError] = useState(initialErrorState);
  const [model, setModel] = useState(false);
  useEffect(() => {
    if (items.length === 0) {
      navigate(-1);
    }
  }, [items.length, navigate]);

  const itemsTotal = items.reduce(
    (old, item) => old + item.product.itemPrice * item.quantity,
    0
  );
  const parcelChargesTotal = items.reduce(
    (old, item) => old + (item.product.parcelCharges ?? 0) * item.quantity,
    0
  );
  if (!shops) {
    return null;
  }
  if (!appConfig) {
    return null;
  }
  if (!userConfig) {
    return null;
  }
  const shopIds = [...new Set(items.map((i) => i.product.shopId))];
  const originalDeliveryFee = shopIds.reduce((old, shopId) => {
    const s = shops?.find((s) => s.shopId === shopId);
    if (!s) return old;
    return old + s.deliveryFee;
  }, 0);
  const deliveryFee = !coupon
    ? shopIds.reduce((old, shopId) => {
        const s = shops?.find((s) => s.shopId === shopId);
        if (!s) return old;
        return old + s.deliveryFee;
      }, 0)
    : 0;

  const { platformFee } = appConfig;
  const grandTotal = Number(
    (itemsTotal + deliveryFee + platformFee + parcelChargesTotal).toFixed(2)
  );

  const onPlaceOrder = () => {
    mutate(
      {
        details: items.map((item) => ({
          itemId: item.product.itemId,
          quantity: item.quantity
        })),
        appliedCoupon: coupon || ''
      },
      {
        onSuccess: () => {
          Analytics.pushEvent('order-placed', {
            productCategory: 'Food',
            productSku: items.map((item) => item.product.itemId),
            revenue: grandTotal
          });
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            removeAll();
            if (window.location.pathname === '/cart') {
              navigate('/', {
                replace: true
              });
            }
          }, 7_000);
        },
        onError: (err) => {
          setError({
            message:
              err.cause?.message ??
              'Something went wrong. Please try again later.',
            products:
              err.cause?.products?.map((product) => product.itemId) ?? []
          });
        }
      }
    );
  };
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
      {success ? (
        <SuccessCheckout />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'space-between',
            minHeight: '90vh'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <SubSection
                style={{
                  marginTop: 0
                }}
              >
                {coupon && (
                  <Alert
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="success"
                    sx={{
                      bgcolor: '#41b594',
                      color: '#fff',
                      borderRadius: '5px'
                    }}
                  >
                    You have saved Rs.{originalDeliveryFee} on this order.
                  </Alert>
                )}

                <Card
                  sx={{ padding: 2, mt: 2 }}
                  elevation={2}
                  style={{
                    borderRadius: '10px'
                  }}
                >
                  {items
                    .sort((a, b) =>
                      a.product.itemName.localeCompare(b.product.itemName)
                    )
                    .map((item, idx) => (
                      <div key={item.product.itemId}>
                        <StyledProduct
                          key={item.product.itemId}
                          error={error.products.includes(item.product.itemId)}
                        >
                          <div>
                            <Typography component="h6">
                              {item.product.itemName}
                            </Typography>
                            <Typography component="h6">
                              ₹{item.product.itemPrice}
                            </Typography>
                          </div>
                          <div>
                            <ButtonGroup
                              variant="outlined"
                              aria-label="update cart"
                            >
                              <Button
                                variant="outlined"
                                onClick={() => removeFromCart(item.product)}
                              >
                                -
                              </Button>
                              <Button
                                variant="outlined"
                                style={{ maxWidth: '2ch' }}
                              >
                                {item.quantity}
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => addToCart(item.product)}
                              >
                                +
                              </Button>
                            </ButtonGroup>
                          </div>
                        </StyledProduct>
                        {idx != items.length - 1 && (
                          <Divider
                            style={{
                              backgroundColor: '#f3faf8',
                              margin: 'auto',
                              width: '40vw'
                            }}
                          />
                        )}
                      </div>
                    ))}
                </Card>
              </SubSection>
              <SubSection>
                <Button
                  onClick={() => {
                    navigate(-1);
                  }}
                  sx={{
                    margin: 'auto'
                  }}
                  variant="outlined"
                  color="success"
                >
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    Add more items
                  </Typography>
                </Button>
                <Button
                  onClick={() => {
                    removeAll();
                    navigate('/');
                  }}
                  sx={{
                    margin: 'auto'
                  }}
                  variant="text"
                  color="warning"
                >
                  <DeleteIcon sx={{ height: 16 }} />
                  <Typography variant="caption">Clear all</Typography>
                </Button>
              </SubSection>
              <Divider
                style={{ width: '40vw', margin: '10px auto' }}
                sx={{ bgcolor: 'primary.main' }}
              />
            </div>
          </Box>
          <Card
            sx={{
              borderRadius: 2,
              mb: 4,
              backgroundColor: '#c0eade',
              position: 'relative',
              backgroundImage:
                'linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.9))'
            }}
            elevation={4}
          >
            <CardContent>
              <Background />
              <Typography variant="h3" sx={{ fontWeight: 900 }}>
                Saved you from paying <br /> Rs.
                {Math.round(grandTotal * 0.28)} extra.
              </Typography>
              <div
                style={{
                  border: '1px dashed #c0f09e',
                  marginBottom: '6px'
                }}
              />
              <TotalWrapper
                sx={{
                  width: '65vw',
                  color: '#ff4b4b',
                  justifyContent: 'normal',
                  gap: 4
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Competitor's Price
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  Rs. {Math.round(grandTotal * 0.28 + grandTotal)}
                </Typography>
              </TotalWrapper>
            </CardContent>
          </Card>
          <div>
            <Card
              elevation={1}
              style={{
                borderRadius: '5px'
              }}
            >
              <Box
                sx={{
                  alignSelf: 'flex-end'
                }}
              >
                <Container
                  component="div"
                  sx={{
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                  }}
                >
                  <TotalWrapper>
                    <Typography component="h6">Item Total </Typography>
                    <Typography component="h6">₹{itemsTotal}</Typography>
                  </TotalWrapper>
                  <TotalWrapper>
                    <Typography component="h6">
                      Delivery
                      <Tooltip
                        title={
                          !coupon
                            ? 'This helps our delivery partners to serve you better.'
                            : `Delivery fee Rs.${originalDeliveryFee} has been waved off`
                        }
                        enterTouchDelay={20}
                        leaveTouchDelay={5_000}
                      >
                        <IconButton sx={{ p: 0, ml: 1 }}>
                          <InfoIcon sx={{ width: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    <div>
                      {coupon && (
                        <Typography
                          variant="caption"
                          sx={{
                            textDecoration: 'line-through',
                            color: '#ff4b4b'
                          }}
                        >
                          ₹ {originalDeliveryFee}
                        </Typography>
                      )}
                      <Typography component="h6">₹ {deliveryFee}</Typography>
                    </div>
                  </TotalWrapper>
                  <TotalWrapper>
                    <Typography component="h6">
                      Platform Fee
                      <Tooltip
                        title="This small fee helps us to keep this platform running."
                        enterTouchDelay={20}
                        leaveTouchDelay={5_000}
                      >
                        <IconButton sx={{ p: 0, ml: 1 }}>
                          <InfoIcon sx={{ width: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    <Typography component="h6">₹ {platformFee}</Typography>
                  </TotalWrapper>
                  {parcelChargesTotal > 0 ? (
                    <TotalWrapper>
                      <Typography component="h6">
                        Parcel Charges
                        <Tooltip
                          title="Industry's lowest ever parcel charges by burn!"
                          enterTouchDelay={20}
                          leaveTouchDelay={5_000}
                        >
                          <IconButton sx={{ p: 0, ml: 1 }}>
                            <InfoIcon sx={{ width: 20 }} />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      <Typography component="h6">
                        ₹ {parcelChargesTotal}
                      </Typography>
                    </TotalWrapper>
                  ) : null}
                  <TotalWrapper>
                    <Typography component="h6">GrandTotal </Typography>
                    <Typography
                      component="h6"
                      sx={{
                        fontWeight: 'bold'
                      }}
                    >
                      ₹{Math.round(grandTotal)}
                    </Typography>
                  </TotalWrapper>
                </Container>
              </Box>
            </Card>
            {error.message ? (
              <Alert
                severity="error"
                onClose={() => {
                  removeAll();
                  setError(initialErrorState);
                }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    href="tel:+91-8754791569"
                  >
                    Call Us
                  </Button>
                }
              >
                {error.message}
              </Alert>
            ) : (
              <SubSection
                sx={{
                  gap: 1,
                  marginBottom: 2
                }}
              >
                <LoadingButton
                  loading={isLoading}
                  loadingPosition="start"
                  startIcon={<ShoppingCartCheckoutIcon />}
                  variant="contained"
                  disabled={isLoading || !appConfig.isOpen}
                  onClick={onPlaceOrder}
                  color="secondary"
                  style={{
                    borderRadius: '10px'
                  }}
                >
                  {appConfig.isOpen
                    ? `Place order ₹ ${grandTotal}`
                    : 'Opens by 7AM'}
                </LoadingButton>
                {coupon ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#41b594',
                      width: 'fit-content',
                      margin: 'auto'
                    }}
                  >
                    Coupon applied: {coupon}
                  </Typography>
                ) : userConfig.myReferralCodes ? (
                  <Button
                    variant="text"
                    color="info"
                    onClick={() => setModel(true)}
                  >
                    Apply coupon
                  </Button>
                ) : null}
              </SubSection>
            )}
          </div>
        </Box>
      )}
      <SwipeableDrawer
        open={model}
        anchor="bottom"
        onClose={() => setModel(false)}
        onOpen={() => {
          setModel(true);
        }}
      >
        <Box
          sx={{
            width: 'min(100vw, 900px)',
            p: 4,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            margin: 'auto',
            background: '#000 url(/abstract_emoji.png)'
          }}
        >
          {userConfig?.availableCoupons?.length === 0 ? (
            <SubSection
              sx={{
                gap: 2
              }}
            >
              <Typography variant="h6" color="secondary">
                No coupons available for you
              </Typography>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="caption" color="secondary">
                  Pro Tip: You could
                  <Typography
                    variant="caption"
                    color="secondary"
                    sx={{ m: 1, textDecoration: 'underline' }}
                  >
                    refer and earn
                  </Typography>
                  coupons.
                </Typography>
                <Typography variant="caption" color="secondary">
                  Your referral code is
                  <Button variant="text" color="info" sx={{ p: 0, ml: 2 }}>
                    {userConfig?.myReferralCodes}
                  </Button>
                </Typography>
              </div>
              <div
                style={{
                  height: '12px'
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  gap: 2
                }}
              >
                <ReferButton
                  myReferralCodes={userConfig.myReferralCodes ?? ''}
                />
                <Button
                  variant="contained"
                  onClick={() => setModel(false)}
                  color="secondary"
                >
                  Close
                </Button>
              </Box>
            </SubSection>
          ) : (
            <Typography variant="h6" color="secondary">
              Available coupons
            </Typography>
          )}
          {userConfig.availableCoupons?.map((coupon) => (
            <Card
              key={coupon}
              elevation={4}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 2,
                borderRadius: '10px',
                backgroundColor: '#c0eade2c'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Typography variant="h6" color="secondary">
                  {coupon}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Free delivery
                </Typography>
              </div>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setCoupon(coupon);
                  setModel(false);
                }}
              >
                Apply
              </Button>
            </Card>
          ))}
        </Box>
      </SwipeableDrawer>
      {confetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}
    </Container>
  );
};

function SuccessCheckout() {
  const { removeAll } = useCart();
  const navigate = useNavigate();
  return (
    <div
      style={{
        height: '92vh',
        width: '100vw',
        backgroundImage: 'url(/abstract_emoji.png)',
        filter: 'brightness(70%)',
        backgroundSize: 'contain',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          height: '75vh'
        }}
      >
        <div
          style={{
            backgroundColor: '#d1ff04',
            color: 'white',
            height: '0px',
            width: '0px',
            borderRadius: '50%',
            padding: '125px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto'
          }}
        >
          <Check
            style={{
              width: 60,
              height: 60,
              color: green[900]
            }}
          />
        </div>
        <Alert
          severity="success"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#d1ff04'
          }}
          icon={null}
        >
          <div>Order placed successfully.</div>
          <div>We will call you shortly to confirm the order.</div>
        </Alert>
        <Button
          color="info"
          onClick={() => {
            removeAll();
            navigate('/', {
              replace: true
            });
          }}
        >
          Back to Home
        </Button>
        <LastOrder />
      </div>
    </div>
  );
}

const ReferButton: FC<{ myReferralCodes: string }> = ({ myReferralCodes }) => {
  const [copied, setCoped] = useState(false);

  if (typeof navigator.share === 'function') {
    <Button
      variant="outlined"
      onClick={() => {
        navigator.share({
          title: 'Burn',
          text: `Hey, I found this amazing app called Burn. It has the lowest prices for food ordering. \n You can also get free delivery on your first order. \n \n Use my referral code ${myReferralCodes} to get your first order delivered free. Use it from http://delivery.goburn.in/`,
          url: 'http://delivery.goburn.in/'
        });
      }}
      color="secondary"
    >
      <WhatsApp />
      Refer and Earn
    </Button>;
  }
  return (
    <Button
      variant="outlined"
      onClick={() => {
        navigator.clipboard.writeText(
          `Food ordering is super cheap at http://delivery.goburn.in/. Use my coupon code to get first delivery free. \nCOUPON CODE: ${myReferralCodes}`
        );
        setCoped(true);
        setTimeout(() => {
          setCoped(false);
        }, 1_000);
      }}
      color="secondary"
    >
      {copied ? <CheckIcon /> : <CopyAll />}
      Copy Code
    </Button>
  );
};
