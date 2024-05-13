import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SkeletonLoader } from './loading.tsx';

const queryClient = new QueryClient();

const onError = (error: Error) => {
  console.error(error);
  alert('An error occurred. Please try again later.');
}

const router = createBrowserRouter([
  {
    path: '/login',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./router/Login.tsx')
        .then((m) => ({
          element: <m.LoginPage />
        }))
        .catch(onError)
  },
  {
    path: '/',
    loader: () => <SkeletonLoader />,
    lazy: () =>
      import('./App.tsx')
        .then((m) => ({
          element: <m.App />
        }))
        .catch(onError)
  },
]);

export const Root = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
