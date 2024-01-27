import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LogRocket from 'logrocket';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import packageJson from '../../package.json';
import { InitProvider } from './module/Context/InitProvider';
import { CartProvider } from './module/Shoping/cart-activity';
import { theme as GlobalTheme } from './theme';
import { LoginPage } from './Routes/Login/Login';
import { ShopPage } from './Routes/Shop/shop';
import { MenuPage } from './Routes/Menu/Menu';
import { SplashPage } from './Routes/Splash/Splash';
import { CartPage } from './Routes/Cart/cart';
import { OrderHistoryRoute } from './Routes/OrderHistory/order-history';

if (process.env.NODE_ENV === 'production') {
  console.log(`init logrocket with ${packageJson.version}`);
  LogRocket.init('oedyyk/chandra', {
    release: process.env.REACT_APP_VERSION
  });
}
const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage
  },
  {
    path: '/',
    Component: ShopPage
  },
  {
    path: '/shop/:shopId',
    Component: MenuPage
  },
  {
    path: '/splash',
    Component: SplashPage,
  },
  {
    path: '/cart',
    Component: CartPage,
  },
  {
    path: '/order-history',
    Component: OrderHistoryRoute,
  },
]);

const theme = createTheme(GlobalTheme);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <InitProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <ToastContainer />
          <CartProvider>
            <RouterProvider router={router}></RouterProvider>
          </CartProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </InitProvider>
  </React.StrictMode>
);
