import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { CssBaseline } from '@mui/material';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SkeletonLoader } from './loading.tsx';

const queryClient = new QueryClient();

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
]);

export const Root = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <RouterProvider router={router}></RouterProvider>
      <App />
    </QueryClientProvider>
  );
};
