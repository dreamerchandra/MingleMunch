import { useContext, useReducer } from 'react';
import { Product } from '../../../common/types/Product';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { createContext } from 'react';

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
type Actions = AddToCartAction | RemoveFromCartAction;

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

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  }, []);
  const removeFromCart = useCallback((product: Product) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: product });
  }, []);

  return useMemo(
    () => ({ cartDetails, addToCart, removeFromCart }),
    [addToCart, cartDetails, removeFromCart]
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
