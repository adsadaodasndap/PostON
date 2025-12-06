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
import WorkerPage from './pages/WorkerPage'
import AdminPage from './pages/Admin'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Login /> },
      {
        path: '/reg',
        element: <Register />,
      },
      {
        path: '/products',
        element: <ProductsPage />,
      },
      {
        path: '/profile',
        element: (
          <WithAuth c={<ProfilePage />} roles={['BUYER', 'SELLER', 'ADMIN']} />
        ),
      },
      {
        path: '/client',
        element: (
          <WithAuth c={<ClientPage />} roles={['BUYER', 'SELLER', 'ADMIN']} />
        ),
      },
      {
        path: '/worker',
        element: <WithAuth c={<WorkerPage />} roles={['SELLER', 'ADMIN']} />,
      },
      {
        path: '/courier',
        element: <WithAuth c={<CourierPage />} roles={['SELLER', 'ADMIN']} />,
      },
      {
        path: '/postomat',
        element: (
          <WithAuth c={<PostomatPage />} roles={['BUYER', 'SELLER', 'ADMIN']} />
        ),
      },
      {
        path: '/admin',
        element: <WithAuth c={<AdminPage />} roles={['ADMIN']} />,
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6f2dbd' },
    background: { default: '#f7f7f9' },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
})

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
    <ToastContainer theme="colored" position="bottom-left" />
  </ThemeProvider>
)
