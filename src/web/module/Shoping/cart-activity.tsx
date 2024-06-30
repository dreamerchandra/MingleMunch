import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react';
import { Analytics } from '../../../common/analytics';
import { post } from '../../firebase/fetch';
import { CartProduct } from '../../../common/types/Order';

type CartState = {
  cart: CartProduct[];
  total: number;
  totalItems: number;
  cartId?: string;
  coupon?: string;
};

const initialState: CartState = {
  cart: [],
  total: 0,
  totalItems: 0,
  cartId: '',
  coupon: ''
};

interface AddToCartAction {
  type: 'ADD_TO_CART';
  payload: CartProduct;
}

interface RemoveFromCartAction {
  type: 'REMOVE_FROM_CART';
  payload: {
    itemId: string;
    parentItemId?: string;
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
      const itemIndex = state.cart.findIndex((item) =>
        action.payload.parentItemId
          ? item.itemId === action.payload.itemId &&
            item.parentItemId === action.payload.parentItemId
          : item.itemId === action.payload.itemId
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
    case 'REMOVE_ALL': {
      return initialState;
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
    return JSON.parse(
      localStorage.getItem(LOCAL_STORAGE) || JSON.stringify(initialState)
    );
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
    localStorage.setItem(LOCAL_STORAGE, JSON.stringify(cartDetails));
  }, [cartDetails]);

  const addToCart = useCallback((product: CartProduct) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    Analytics.pushEvent('cart-added', {
      productCategory: 'Food',
      productSku: product.itemId
    });
  }, []);

  const addMultipleToCart = useCallback(
    (products: CartProduct, quality: number) => {
      for (let i = 0; i < quality; i++) {
        addToCart(products);
      }
    },
    [addToCart]
  );
  const removeFromCart = useCallback(
    (product: CartProduct) => {
      product.suggestionIds?.map((suggestion) => {
        dispatch({
          type: 'REMOVE_FROM_CART',
          payload: {
            itemId: suggestion,
            parentItemId: product.parentItemId,
          }
        });
      });
      dispatch({ type: 'REMOVE_FROM_CART', payload: product });
      Analytics.pushEvent('cart-removed', {
        productCategory: 'Food',
        productSku: product.itemId
      });
    },
    []
  );
  const removeAll = useCallback(() => {
    dispatch({ type: 'REMOVE_ALL' });
    Analytics.pushEvent('cart-removed_all');
  }, []);
  const updateCartId = useCallback((cartId: string) => {
    dispatch({ type: 'CART_ID', payload: { cartId } });
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
      updateCoupon
    }),
    [
      addToCart,
      cartDetails,
      removeFromCart,
      removeAll,
      addMultipleToCart,
      updateCartId,
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
    if (!data) return { coupon: '', isExpired: true, expireBy: new Date() };
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
