
import React from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/toaster';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProfileSettings from './pages/ProfileSettings';
import NotFound from './pages/NotFound';
import Analytics from './pages/Analytics';
import Index from './pages/Index';
import AccountSwitcher from './pages/AccountSwitcher';

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Index />,
      errorElement: <NotFound />
    },
    {
      path: '/dashboard',
      element: <Dashboard />,
      errorElement: <NotFound />
    },
    {
      path: '/analytics',
      element: <Analytics />,
    },
    {
      path: '/profile',
      element: <ProfileSettings />,
    },
    {
      path: '/switch-accounts',
      element: <AccountSwitcher />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
