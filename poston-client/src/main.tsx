import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import RootLayout from './components/RootLayout'
import WithAuth from './components/WithAuth'
import './i18n'
import './index.css'
import ClientPage from './pages/ClientPage'
import CourierPage from './pages/CourierPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PostomatPage from './pages/PostomatPage'
import ProductsPage from './pages/ProductsPage'
import ProfilePage from './pages/ProfilePage'
import Register from './pages/Register'
import AdminPage from './pages/Admin'
import WorkerPage from './pages/WorkerPage'
import AssistantPage from './pages/AssistantPage'

import 'react-toastify/dist/ReactToastify.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '/', element: <ProductsPage /> },
      { path: '/auth', element: <Login /> },
      { path: '/register', element: <Register /> },
      {
        path: '/profile',
        element: (
          <WithAuth
            c={<ProfilePage />}
            roles={['BUYER', 'SELLER', 'ADMIN', 'COURIER', 'POSTAMAT']}
          />
        ),
      },
      {
        path: '/products',
        element: <ProductsPage />,
      },
      {
        path: '/client',
        element: (
          <WithAuth c={<ClientPage />} roles={['SELLER', 'ADMIN', 'BUYER']} />
        ),
      },
      {
        path: '/courier',
        element: (
          <WithAuth
            c={<CourierPage />}
            roles={['SELLER', 'ADMIN', 'COURIER']}
          />
        ),
      },
      {
        path: '/postomat',
        element: (
          <WithAuth
            c={<PostomatPage />}
            roles={['ADMIN', 'BUYER', 'COURIER', 'POSTAMAT']}
          />
        ),
      },
      {
        path: '/admin',
        element: <WithAuth c={<AdminPage />} roles={['ADMIN']} />,
      },
      {
        path: '/worker',
        element: <WithAuth c={<WorkerPage />} roles={['SELLER']} />,
      },
      {
        path: '/assistant',
        element: (
          <WithAuth
            c={<AssistantPage />}
            roles={['BUYER', 'SELLER', 'ADMIN', 'COURIER']}
          />
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6a1b9a',
    },
  },
})

createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
    <ToastContainer position="top-right" autoClose={2500} />
  </ThemeProvider>
)
