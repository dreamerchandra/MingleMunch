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
  payload: {
    itemId: string;
  };
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
    Analytics.pushEvent('cart-added', {
      productCategory: 'Food',
      productSku: product.itemId
    });
  }, []);

  const addMultipleToCart = useCallback((products: Product, quality: number) => {
    for (let i = 0; i < quality; i++) {
      addToCart(products);
    }
  }, [addToCart]);
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

  return useMemo(
    () => ({ cartDetails, addToCart, removeFromCart, removeAll, addMultipleToCart }),
    [addToCart, cartDetails, removeFromCart, removeAll, addMultipleToCart]
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
