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

const router = createBrowserRouter([
  {
    path: '/',
    lazy: () =>
      import('./Routes/Home/Home').then((m) => ({
        element: <m.HomePage />
      }))
  },
  {
    path: '/login',
    lazy: () =>
      import('./Routes/Login/Login').then((m) => ({
        element: <m.LoginPage />
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
          <RouterProvider router={router}></RouterProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </InitProvider>
  </React.StrictMode>
);
