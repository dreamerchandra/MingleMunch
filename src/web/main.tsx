import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User } from 'firebase/auth';
import LogRocket from 'logrocket';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import packageJson from '../../package.json';
import './index.css';
import { InitProvider } from './module/Context/InitProvider';
import { CartProvider } from './module/Shoping/cart-activity';
import { theme as GlobalTheme } from './theme';
import { Analytics } from '../common/analytics';
import { isInternal } from '../common/types/constant';
import { SkeletonLoader } from './module/loading';

declare global {
  interface Window {
    errorTimerId?: number;
    u?: User;
  }
}


document.getElementById('errorMsg')?.remove();
clearTimeout(window.errorTimerId);
localStorage.setItem('date', new Date().toISOString());
window.addEventListener('focus', () => {
  if (localStorage.getItem('date')) {
    const date = new Date(localStorage.getItem('date') as string);
    const diff = new Date().getTime() - date.getTime();
    const fortyFiveMin = 1000 * 60 * 45;
    if (diff > fortyFiveMin) {
      localStorage.removeItem('date');
      window.location.reload();
    }
  }
});

const pushToAnalytics = async () => {
  setTimeout(() => {
    let analyticsId = localStorage.getItem('analyticsId');
    if (!analyticsId) {
      analyticsId = `${Math.random()}`;
      localStorage.setItem('analyticsId', analyticsId);
    }
    Analytics.init(
      analyticsId
    );
    const baseUrl = window.location.href.includes('localhost')
      ? 'http://localhost:5001/mingle-munch/asia-south1/order'
      : 'https://asia-south1-mingle-munch.cloudfunctions.net/order';
    fetch(`${baseUrl}/v1/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        analyticsId,
        userId: window.u?.uid,
        isInternal,
      })
    })
      .then(() => {
        console.log('done');
      })
      .catch((err) => {
        console.log(err);
      }); 
  }, 5000);
};

pushToAnalytics();
if (window.location.hostname !== 'localhost' && !isInternal) {
  console.log(`init logrocket with ${packageJson.version}`);
  LogRocket.init('oedyyk/chandra', {
    release: process.env.REACT_APP_VERSION
  });
}

const onError = (e: Error) => {
  const isChunkLoadError =
    e && e.message.includes('Failed to fetch dynamically imported module');
  if (isChunkLoadError && window?.location?.reload) {
    window.location.reload();
  }
  return {
    element: null
  };
};
const router = createBrowserRouter([
  {
    path: '/login',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./Routes/Login/Login')
        .then((m) => ({
          element: <m.LoginPage />
        }))
        .catch(onError)
  },
  {
    path: '/',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./Routes/Shop/shop')
        .then((m) => ({
          element: <m.ShopPage />
        }))
        .catch(onError)
  },
  {
    path: '/shop/:shopId',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./Routes/Menu/Menu')
        .then((m) => ({
          element: <m.MenuPage />
        }))
        .catch(onError)
  },
  {
    path: '/shop/:shopId/product/:productId',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./Routes/Menu/Menu')
        .then((m) => ({
          element: <m.MenuPage />
        }))
        .catch(onError)
  },
  {
    path: '/splash',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./Routes/Splash/Splash')
        .then((m) => ({
          element: <m.SplashPage />
        }))
        .catch(onError)
  },
  {
    path: '/cart',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./Routes/Cart/cart')
        .then((m) => ({
          element: <m.CartPage />
        }))
        .catch(onError)
  },
  {
    path: '/order-history',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./Routes/OrderHistory/order-history')
        .then((m) => ({
          element: <m.OrderHistoryRoute />
        }))
        .catch(onError)
  },
  {
    path: '/profile',
    lazy: () =>
      import('./Routes/Profile/Profile')
        .then((m) => ({
          element: <m.Profile />
        }))
        .catch(onError)
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
