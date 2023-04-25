import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createBrowserRouter([
  {
    path: '/',
    lazy: () =>
      import('./Routes/Home/Home').then((m) => ({
        Component: m.HomePage
      }))
  },
  {
    path: '/login',
    lazy: () =>
      import('./Routes/Login/Login').then((m) => ({
        Component: m.LoginPage
      }))
  },
  {
    path: '/order-history',
    lazy: () =>
      import('./Routes/OrderHistory/order-history').then((m) => ({
        Component: m.OrderHistoryRoute
      }))
  }
]);

const theme = createTheme();
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <RouterProvider router={router}></RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
