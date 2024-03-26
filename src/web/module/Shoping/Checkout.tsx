import { Add, Check, CopyAll, Remove, WhatsApp } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import LoadingButton from '@mui/lab/LoadingButton';
import { SwipeableDrawer } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '../../../common/analytics';
import { Product } from '../../../common/types/Product';
import { DeliveryFeeResponse } from '../../firebase/order';
import { LastOrder } from '../LastOrder/LastOrder';
import { useShopQuery } from '../Shop/shop-query';
import {
  AppConfig,
  UserConfig,
  useAppConfig,
  useUserConfig
} from '../appconfig';
import { useCart } from './cart-activity';
import { useDeliveryFee, useMutationCreateOrder } from './checkout-query';
import { SkeletonLoader } from '../loading';

const StyledProduct = styled('div')<{ error: boolean }>(({ theme, error }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  width: '100%',
  margin: theme.spacing(2, 0),
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
  marginTop: theme.spacing(1),
  '.right': {
    fontWeight: 400,
    fontSize: '1rem'
  },
  '.left': {
    m: 0,
    lineHeight: 1,
    width: '85%',
    '*': {
      m: 0,
      lineHeight: 1
    }
  },
  h4: {
    lineHeight: 1
  }
}));

const SubSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(2),
  gap: theme.spacing(2)
}));

const CheckoutCard: FC<{
  items: { quantity: number; product: Product }[];
  error: any;
}> = ({ items, error }) => {
  const { addToCart, removeFromCart } = useCart();
  return (
    <Card
      elevation={2}
      color="white"
      sx={{
        boxShadow: '0px 0px 10px 0px #0000001f',
        background: '#fff',
        px: 2
      }}
    >
      {items
        .sort((a, b) => a.product.itemName.localeCompare(b.product.itemName))
        .map((item) => (
          <StyledProduct
            key={item.product.itemId}
            error={error.products.includes(item.product.itemId)}
          >
            <div>
              <Typography component="h6" variant="h4">
                {item.product.itemName}
              </Typography>
              <Typography component="h6" variant="body2">
                ₹{item.product.itemPrice}
              </Typography>
            </div>
            <div>
              <Container
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'end',
                  p: 0
                }}
              >
                <Button
                  size="small"
                  sx={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    minWidth: '0px'
                  }}
                  onClick={() => removeFromCart(item.product)}
                >
                  <Remove fontSize="small" />
                </Button>
                <Typography variant="h4" color="green">
                  {item.quantity}
                </Typography>
                <Button
                  size="small"
                  sx={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    minWidth: '0px'
                  }}
                  onClick={() => {
                    addToCart(item.product);
                  }}
                >
                  <Add fontSize="small" />
                </Button>
              </Container>
            </div>
          </StyledProduct>
        ))}
    </Card>
  );
};

const CompetitorBanner: FC<{ grandTotal: number }> = ({ grandTotal }) => {
  return (
    <Card
      sx={{
        flexShrink: 0,
        borderRadius: 2,
        backgroundColor: '#c0eade',
        position: 'relative',
        boxShadow: '0px 0px 10px 0px #0000001f',
        backgroundImage:
          'linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.9))'
      }}
    >
      <CardContent>
        <Background />
        <Typography
          variant="h3"
          sx={{ fontWeight: 900 }}
          color="text.secondary"
        >
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
          <Typography variant="h6" fontWeight="semibold">
            Competitor's Price
          </Typography>
          <Typography variant="h6" fontWeight="semibold">
            Rs. {Math.round(grandTotal * 0.28 + grandTotal)}
          </Typography>
        </TotalWrapper>
      </CardContent>
    </Card>
  );
};

const TotalCard: FC<{
  itemsTotal: number;
  coupon: string;
  originalDeliveryFee: number;
  deliveryFee: number;
  platformFee: number;
  parcelChargesTotal: number;
  grandTotal: number;
  deliveryDetails: DeliveryFeeResponse | null;
}> = ({
  itemsTotal,
  deliveryFee,
  platformFee,
  grandTotal,
  deliveryDetails
}) => {
  return (
    <Card
      sx={{
        flexShrink: 0,
        borderRadius: 2,
        backgroundColor: '#fff',
        position: 'relative',
        boxShadow: '0px 0px 10px 0px #0000001f'
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
            width: '100%',
            gap: 0.5
          }}
        >
          <TotalWrapper>
            <Typography component="h4" variant="h6">
              Item Total
            </Typography>
            <Typography component="h6" className="right">
              ₹{itemsTotal}
            </Typography>
          </TotalWrapper>
          {deliveryFee != 0 && (
            <TotalWrapper>
              <div className="left">
                <Typography component="h4" variant="h6">
                  Delivery
                  <Tooltip
                    title={deliveryDetails?.deliveryFee.info}
                    enterTouchDelay={20}
                    leaveTouchDelay={5_000}
                  >
                    <IconButton sx={{ p: 0, ml: 1 }}>
                      <InfoIcon sx={{ width: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
                {deliveryDetails?.deliveryFee.reason && (
                  <Typography variant="caption" color={'red'}>
                    {deliveryDetails?.deliveryFee.reason}
                  </Typography>
                )}
              </div>
              <Typography component="h6" className="right">
                ₹ {deliveryFee}
              </Typography>
            </TotalWrapper>
          )}
          {deliveryDetails?.smallCartFree?.[-1] ? (
            <TotalWrapper>
              <div className="left">
                <Typography component="h4" variant="h6">
                  Small Cart Fee
                </Typography>
                <Typography variant="caption" color="red">
                  {deliveryDetails?.smallCartFree?.[-1].reason}
                </Typography>
              </div>
              <Typography component="h6" className="right">
                ₹ {deliveryDetails?.smallCartFree?.[-1].amount}
              </Typography>
            </TotalWrapper>
          ) : null}
          {(deliveryDetails?.convenienceFee?.amount ?? 0) != 0 && (
            <TotalWrapper>
              <div className="left">
                <Typography component="h4" variant="h6">
                  Convenience Fee
                  <Tooltip
                    title={deliveryDetails?.convenienceFee.info}
                    enterTouchDelay={20}
                    leaveTouchDelay={5_000}
                  >
                    <IconButton sx={{ p: 0, ml: 1 }}>
                      <InfoIcon sx={{ width: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
                {deliveryDetails?.convenienceFee?.reason && (
                  <Typography variant="caption" color="red">
                    {deliveryDetails?.convenienceFee?.reason}
                  </Typography>
                )}
              </div>
              <Typography component="h6" className="right">
                ₹ {deliveryDetails?.convenienceFee?.amount}
              </Typography>
            </TotalWrapper>
          )}
          <TotalWrapper>
            <div className="left">
              <Typography component="h4" variant="h6">
                Platform Fee
                <Tooltip
                  title={deliveryDetails?.platformFee.info}
                  enterTouchDelay={20}
                  leaveTouchDelay={5_000}
                >
                  <IconButton sx={{ p: 0, ml: 1 }}>
                    <InfoIcon sx={{ width: 20 }} />
                  </IconButton>
                </Tooltip>
              </Typography>
            </div>
            <Typography component="h6" className="right">
              ₹ {platformFee}
            </Typography>
          </TotalWrapper>
          <TotalWrapper>
            <Typography component="h4" variant="h4">
              GrandTotal
            </Typography>
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
  );
};
const initialErrorState = { message: '', products: [] as string[] };

const ApplyCouponDrawer: FC<{
  model: boolean;
  setModel: (open: boolean) => void;
  userConfig: UserConfig;
  setCoupon: (c: string) => void;
}> = ({ model, setModel, userConfig, setCoupon }) => {
  return (
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
              <ReferButton myReferralCodes={userConfig.myReferralCodes ?? ''} />
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
  );
};

const Footer: FC<{
  error: any;
  setError: (a: any) => void;
  isLoading: boolean;
  onPlaceOrder: () => void;
  grandTotal: number;
  coupon: string;
  setModel: (show: boolean) => void;
  appConfig: AppConfig;
  userConfig: UserConfig;
  cartId?: string;
}> = ({
  error,
  setError,
  isLoading,
  appConfig,
  onPlaceOrder,
  grandTotal,
  coupon,
  userConfig,
  setModel,
  cartId
}) => {
  const { removeAll } = useCart();
  return (
    <>
      {error.message ? (
        <Alert
          severity="error"
          onClose={() => {
            removeAll();
            setError(initialErrorState);
          }}
          action={
            <Button color="inherit" size="small" href="tel:+91-8754791569">
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
            disableElevation
          >
            {cartId
              ? `Update Order ₹ ${grandTotal}`
              : appConfig.isOpen
              ? `Place order ₹ ${grandTotal}`
              : appConfig.closeReason}
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
          ) : userConfig.availableCoupons?.length ? (
            <Button
              variant="text"
              color="success"
              onClick={() => setModel(true)}
              sx={{
                fontWeight: 800
              }}
            >
              {userConfig.availableCoupons.length} COUPON AVAILABLE
            </Button>
          ) : null}
        </SubSection>
      )}
    </>
  );
};

export const Checkout: FC = () => {
  const { cartDetails, removeAll } = useCart();
  const { cartId } = cartDetails;
  const { data: shops } = useShopQuery();
  const { data: appConfig } = useAppConfig();
  const { data: userConfig } = useUserConfig();
  const [coupon, _setCoupon] = useState('');
  const { deliveryDetails, isLoading: isDeliveryFeeLoading } = useDeliveryFee();
  const [confetti, setConfetti] = useState({
    show: false,
    opacity: 0.5
  });
  const setCoupon = (coupon: string) => {
    setConfetti({ show: true, opacity: 0.5 });
    const intervalId = setInterval(() => {
      setConfetti((c) => {
        if (c.opacity <= 0) {
          clearInterval(intervalId);
          setConfetti({ show: false, opacity: 0.5 });
        }
        return { ...c, opacity: c.opacity - 0.01 };
      });
    }, 100);
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
  const [error, setError] = useState(initialErrorState);
  const [model, setModel] = useState(false);
  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
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
  const parcelChargesByShop = items.reduce((old, item) => {
    if (!old[item.product.shopId]) {
      old[item.product.shopId] = 0;
    }
    old[item.product.shopId] +=
      (item.product.parcelCharges ?? 0) * item.quantity;
    return old;
  }, {} as Record<string, number>);
  if (!shops) {
    return <SkeletonLoader />;
  }
  if (!appConfig) {
    return <SkeletonLoader />;
  }
  if (!userConfig) {
    return <SkeletonLoader />;
  }
  if (isDeliveryFeeLoading) {
    return <SkeletonLoader />;
  }
  const init = {
    amount: 0
  };
  const {
    convenienceFee = init,
    deliveryFee = init,
    platformFee = init,
    smallCartFree
  } = deliveryDetails || {};

  const smallCartFeeTotal = Object.values(smallCartFree ?? {}).reduce(
    (sum, s) => s.amount + sum,
    0
  );
  const grandTotal = Number(
    (
      itemsTotal +
      convenienceFee.amount +
      smallCartFeeTotal +
      deliveryFee.amount +
      platformFee.amount +
      parcelChargesTotal
    ).toFixed(2)
  );

  const onPlaceOrder = () => {
    mutate(
      {
        details: items.map((item) => ({
          itemId: item.product.itemId,
          quantity: item.quantity
        })),
        appliedCoupon: coupon || '',
        orderId: cartId
      },
      {
        onSuccess: () => {
          if ('navigator' in window && 'vibrate' in navigator) {
            navigator.vibrate(200);
          }
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
  if (success) {
    return <SuccessCheckout />;
  }
  const itemByShop = items.reduce((acc, item) => {
    if (!acc[item.product.shopId]) {
      acc[item.product.shopId] = [];
    }
    acc[item.product.shopId].push(item);
    return acc;
  }, {} as Record<string, { product: Product; quantity: number }[]>);
  const isMultiCart = Object.keys(itemByShop).length > 1;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'space-between',
        minHeight: '87dvh',
        backgroundColor: isMultiCart ? '#eef7e6' : ''
      }}
    >
      {isMultiCart && (
        <Alert
          sx={{
            backgroundColor: '#c5f2a9',
            borderRadius: '0 0 45px 45px'
          }}
        >
          <Typography variant="h4" color="text.secondary">
            Happy Clubbing!
          </Typography>
          <Typography variant="caption">
            Multiple restaurants, more value, one order <br/> – exclusively at Burn.
          </Typography>
        </Alert>
      )}
      <SubSection>
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
            You have saved Rs.{deliveryFee.amount} on this order.
          </Alert>
        )}
        {Object.keys(itemByShop)
          .sort((a, b) => a.localeCompare(b))
          .map((shopId) => {
            return (
              <Box
                key={shopId}
                sx={{
                  mt: 3
                }}
              >
                <Typography variant="h4" component="h4" color="text.secondary">
                  {shops.find((shop) => shop.shopId === shopId)?.shopName}
                </Typography>
                <CheckoutCard
                  items={itemByShop[shopId]}
                  error={error}
                  key={shopId}
                />
                {parcelChargesByShop[shopId] ||
                deliveryDetails?.smallCartFree?.[shopId] ? (
                  <Card
                    sx={{
                      flexShrink: 0,
                      borderRadius: 1,
                      backgroundColor: '#fff',
                      position: 'relative',
                      boxShadow: '0px 0px 10px 0px #0000001f',
                      mt: 1
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
                          width: '100%',
                          gap: 0.5
                        }}
                      >
                        {parcelChargesByShop[shopId] ? (
                          <TotalWrapper>
                            <Typography component="h4" variant="h6">
                              Parcel Charges (
                              {
                                shops.find((shop) => shop.shopId === shopId)
                                  ?.shopName
                              }
                              )
                            </Typography>
                            <Typography component="h6" className="right">
                              ₹{parcelChargesByShop[shopId]}
                            </Typography>
                          </TotalWrapper>
                        ) : null}
                        {(deliveryDetails?.smallCartFree?.[shopId]?.amount ??
                          0) != 0 && (
                          <TotalWrapper>
                            <div className="left">
                              <Typography component="h4" variant="h6">
                                Small Cart Fee (
                                {
                                  shops.find((shop) => shop.shopId === shopId)
                                    ?.shopName
                                }
                                )
                              </Typography>
                              <Typography variant="caption" color="red">
                                {
                                  deliveryDetails?.smallCartFree?.[shopId]
                                    .reason
                                }
                              </Typography>
                            </div>
                            <Typography component="h6" className="right">
                              ₹{' '}
                              {deliveryDetails?.smallCartFree?.[shopId].amount}
                            </Typography>
                          </TotalWrapper>
                        )}
                      </Container>
                    </Box>
                  </Card>
                ) : null}
              </Box>
            );
          })}

        {deliveryDetails?.deliveryFee?.reason && (
          <Alert severity="error">
            <Typography variant="caption">
              {deliveryDetails?.deliveryFee?.reason}
            </Typography>
          </Alert>
        )}
        <Button
          onClick={() => {
            navigate('/');
          }}
          sx={{
            margin: 'auto'
          }}
          variant="outlined"
          color="success"
        >
          <Add />
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            Add More
          </Typography>
        </Button>
        <Button
          onClick={() => {
            removeAll();
            navigate('/');
          }}
          sx={{
            margin: 'auto',
            mt: -1
          }}
          variant="text"
          color="warning"
        >
          <DeleteIcon sx={{ height: 16 }} />
          <Typography variant="caption">Clear all</Typography>
        </Button>
      </SubSection>
      <SubSection>
        <CompetitorBanner grandTotal={grandTotal} />
      </SubSection>
      <SubSection>
        <TotalCard
          itemsTotal={itemsTotal}
          coupon={coupon}
          originalDeliveryFee={deliveryFee.amount}
          deliveryFee={deliveryFee.amount}
          platformFee={platformFee.amount}
          parcelChargesTotal={parcelChargesTotal}
          grandTotal={grandTotal}
          deliveryDetails={deliveryDetails}
        />
      </SubSection>
      <SubSection
        sx={{
          mt: -1
        }}
      >
        <Footer
          appConfig={appConfig}
          coupon={coupon}
          error={error}
          grandTotal={grandTotal}
          isLoading={isLoading}
          onPlaceOrder={onPlaceOrder}
          setError={setError}
          setModel={setModel}
          userConfig={userConfig}
          cartId={cartId}
        />
      </SubSection>
      {userConfig.availableCoupons && (
        <ApplyCouponDrawer
          model={model}
          setCoupon={setCoupon}
          setModel={setModel}
          userConfig={userConfig}
        />
      )}
      {confetti.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '80vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'end',
            filter: `opacity(${confetti.opacity})`
          }}
        >
          <img src="https://media.tenor.com/aKPcD7T8KtUAAAAi/confetti-glitter.gif" />
        </div>
      )}
    </Box>
  );
};

function SuccessCheckout() {
  const { removeAll } = useCart();
  const navigate = useNavigate();
  return (
    <div
      style={{
        height: '100svh',
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
