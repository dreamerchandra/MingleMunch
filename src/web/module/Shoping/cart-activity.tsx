import { useContext, useEffect, useReducer } from 'react';
import { Product } from '../../../common/types/Product';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { createContext } from 'react';
import LogRocket from 'logrocket';

interface CartState {
  cart: Product[];
  total: number;
  totalItems: number;
}

const initialState: CartState = {
  cart: [],
  total: 0,
  totalItems: 0
};

interface AddToCartAction {
  type: 'ADD_TO_CART';
  payload: Product;
}

interface RemoveFromCartAction {
  type: 'REMOVE_FROM_CART';
  payload: Product;
}
interface RemoveAllFromCartAction {
  type: 'REMOVE_ALL';
}

type Actions = AddToCartAction | RemoveFromCartAction | RemoveAllFromCartAction;

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

      return {
        ...state,
        cart: state.cart.filter((_, index) => index !== itemIndex),
        total: state.total - action.payload.itemPrice,
        totalItems: state.totalItems - 1
      };
    }
    case 'REMOVE_ALL': {
      return initialState;
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

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    LogRocket.track('cart-added', {
      productCategory: 'Food',
      productSku: product.itemId,
   });
  }, []);
  const removeFromCart = useCallback((product: Product) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: product });
    LogRocket.track('cart-removed', {
      productCategory: 'Food',
      productSku: product.itemId,
   });
  }, []);
  const removeAll = useCallback(() => {
    dispatch({ type: 'REMOVE_ALL' });
    LogRocket.track('cart-removed', {
      productCategory: 'Food',
      productSku: 'all',
   });
  }, []);

  return useMemo(
    () => ({ cartDetails, addToCart, removeFromCart, removeAll }),
    [addToCart, cartDetails, removeFromCart, removeAll]
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
