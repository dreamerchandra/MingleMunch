import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InitProvider } from './module/Context/InitProvider';
import { theme as GlobalTheme } from './theme';
import { CartProvider } from './module/Shoping/cart-activity';
import LogRocket from 'logrocket';
import packageJson from '../../package.json';

if (process.env.NODE_ENV === 'production') {
  console.log(`init logrocket with ${packageJson.version}`);
  LogRocket.init('oedyyk/chandra', {
    release: process.env.REACT_APP_VERSION
  });
}
const router = createBrowserRouter([
  {
    path: '/login',
    lazy: () =>
      import('./Routes/Login/Login').then((m) => ({
        element: <m.LoginPage />
      }))
  },
  {
    path: '/',
    lazy: () =>
      import('./Routes/Shop/shop').then((m) => ({
        element: <m.ShopPage />
      }))
  },
  {
    path: '/shop/:shopId',
    lazy: () =>
      import('./Routes/Menu/Menu').then((m) => ({
        element: <m.MenuPage />
      }))
  },
  {
    path: '/splash',
    lazy: () =>
      import('./Routes/Splash/Splash').then((m) => ({
        element: <m.SplashPage />
      }))
  },
  {
    path: '/cart',
    lazy: () =>
      import('./Routes/Cart/cart').then((m) => ({
        element: <m.CartPage />
      }))
  },
  {
    path: '/order-history',
    lazy: () =>
      import('./Routes/OrderHistory/order-history').then((m) => ({
        element: <m.OrderHistoryRoute />
      }))
  },
  {
    path: '/payments',
    lazy: () =>
      import('./Routes/Payment/Payment').then((m) => ({
        element: <m.PaymentRoute />
      }))
  }
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
