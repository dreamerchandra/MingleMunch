import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react';
import { Analytics } from '../../../common/analytics';
import { Product } from '../../../common/types/Product';
import { post } from '../../firebase/fetch';

type CartState = {
  cart: Product[];
  total: number;
  totalItems: number;
  cartId?: string;
  locationId: string;
  coupon?: string;
};

const initialState: CartState = {
  cart: [],
  total: 0,
  totalItems: 0,
  cartId: '',
  locationId: '',
  coupon: '',
};

interface AddToCartAction {
  type: 'ADD_TO_CART';
  payload: Product;
}

interface RemoveFromCartAction {
  type: 'REMOVE_FROM_CART';
  payload: {
    itemId: string;
  };
}
interface RemoveAllFromCartAction {
  type: 'REMOVE_ALL';
}

interface UpdateCartId {
  type: 'CART_ID';
  payload: {
    cartId: string;
  };
}

interface UpdateLocation {
  type: 'UPDATE_LOCATION';
  payload: {
    locationId: string;
  }
};
interface UpdateCoupon {
  type: 'COUPON';
  payload: {
    coupon: string;
  };
}

type Actions =
  | AddToCartAction
  | RemoveFromCartAction
  | RemoveAllFromCartAction
  | UpdateCartId
  | UpdateLocation
  | UpdateCoupon;

const cartActivityReducer = (state: CartState, action: Actions) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        cart: [...state.cart, action.payload],
        total: state.total + action.payload.itemPrice,
        totalItems: state.totalItems + 1
      };
    case 'REMOVE_FROM_CART': {
      const itemIndex = state.cart.findIndex(
        (item) => item.itemId === action.payload.itemId
      );
      const product = state.cart[itemIndex];
      if (!product) return state;

      return {
        ...state,
        cart: state.cart.filter((_, index) => index !== itemIndex),
        total: state.total - product.itemPrice,
        totalItems: state.totalItems - 1
      };
    }
    case 'UPDATE_LOCATION':
      return {
        ...state,
        locationId: action.payload.locationId
      };
    case 'REMOVE_ALL': {
      return { ...initialState, locationId: state.locationId };
    }
    case 'CART_ID': {
      return {
        ...state,
        cartId: action.payload.cartId
      };
    }
    case 'COUPON': {
      return {
        ...state,
        coupon: action.payload.coupon
      };
    }
    default:
      return state;
  }
};

const LOCAL_STORAGE = 'in-cart';

const getFromLocalStorage = () => {
  try {
    const cartDetails = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE) || JSON.stringify(initialState)
    );
    const locationDetails = JSON.parse(
      localStorage.getItem('locationId') || JSON.stringify({})
    );
    const now = new Date();
    const twoHours = 1000 * 60 * 60 * 2;
    const isExpired = now.getTime() - locationDetails.now > twoHours;
    if (isExpired) {
      return initialState;
    }
    if (!locationDetails.locationId) return initialState;
    return { ...cartDetails, locationId: locationDetails.locationId };
  } catch {
    /* empty */
  }
  return initialState;
};

const useCartActivity = () => {
  const [cartDetails, dispatch] = useReducer(
    cartActivityReducer,
    initialState,
    getFromLocalStorage
  );

  useEffect(() => {
    const locationId = cartDetails.locationId;
    if (locationId) {
      const now = new Date().getTime();
      const info = { now, locationId };
      localStorage.setItem('locationId', JSON.stringify(info));
    } else {
      localStorage.removeItem('locationId');
    }
    localStorage.setItem(
      LOCAL_STORAGE,
      JSON.stringify({ ...cartDetails, locationId: '' })
    );
  }, [cartDetails]);

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    Analytics.pushEvent('cart-added', {
      productCategory: 'Food',
      productSku: product.itemId
    });
  }, []);

  const addMultipleToCart = useCallback(
    (products: Product, quality: number) => {
      for (let i = 0; i < quality; i++) {
        addToCart(products);
      }
    },
    [addToCart]
  );
  const removeFromCart = useCallback((product: Product) => {
    product.suggestionIds?.map((suggestion) => {
      dispatch({
        type: 'REMOVE_FROM_CART',
        payload: {
          itemId: suggestion
        }
      });
    });
    dispatch({ type: 'REMOVE_FROM_CART', payload: product });
    Analytics.pushEvent('cart-removed', {
      productCategory: 'Food',
      productSku: product.itemId
    });
  }, []);
  const removeAll = useCallback(() => {
    dispatch({ type: 'REMOVE_ALL' });
    Analytics.pushEvent('cart-removed_all');
  }, []);
  const updateCartId = useCallback((cartId: string) => {
    dispatch({ type: 'CART_ID', payload: { cartId } });
  }, []);
  const updateLocation = useCallback((locationId: string) => {
    dispatch({ type: 'UPDATE_LOCATION', payload: { locationId } });
  }, []);
  const updateCoupon = useCallback((coupon: string) => {
    dispatch({ type: 'COUPON', payload: { coupon } });
  }, []);

  return useMemo(
    () => ({
      cartDetails,
      addToCart,
      removeFromCart,
      removeAll,
      addMultipleToCart,
      updateCartId,
      updateLocation,
      updateCoupon
    }),
    [
      addToCart,
      cartDetails,
      removeFromCart,
      removeAll,
      addMultipleToCart,
      updateCartId,
      updateLocation,
      updateCoupon
    ]
  );
};

const CartContext = createContext({} as ReturnType<typeof useCartActivity>);
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const cartActivity = useCartActivity();
  return (
    <CartContext.Provider value={cartActivity}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};

export const useCoupon = () => {
  const key = 'INVITE_COUPON_V1';
  const oldKey = 'INVITE_COUPON';
  const pushKey = 'INVITE_COUPON_V1_PUSH';
  const set = useCallback((coupon: string) => {
    const now = new Date();
    const data = {
      coupon,
      date: now.toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
    const deviceId = localStorage.getItem('analyticsId');
    localStorage.setItem(pushKey, 'true');
    post('/v1/invited-ack', {
      coupon,
      deviceId
    });
  }, []);
  const get = useCallback(() => {
    const oldKeyData = localStorage.getItem(oldKey);
    if (oldKeyData) {
      set(oldKeyData);
      localStorage.removeItem(oldKey);
    }
    const data = localStorage.getItem(key);
    if (!data) return {coupon: '', isExpired: true, expireBy: new Date()};
    const { coupon, date } = JSON.parse(data);
    const expireBy = new Date(date);
    expireBy.setDate(expireBy.getDate() + 5);
    const isExpired = new Date() > expireBy;
    return { coupon, isExpired, expireBy };
  }, [set]);
  const remove = useCallback(() => {
    localStorage.removeItem(key);
  }, []);
  return { set, get, remove };
};
