import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import './index.css'
import App from './App'
import Login from './Login'
import Register from './Register'
import ClientPage from './ClientPage'
import WorkerPage from './WorkerPage'
import CourierPage from './CourierPage'
import PostomatPage from './PostomatPage'
import './i18n'
import WithAuth from './components/WithAuth'
import RootLayout from './components/RootLayout'
import NotFound from './pages/NotFound'
import { ToastContainer } from 'react-toastify'

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
        path: '/app',
        element: <WithAuth c={<App />} roles={['BUYER', 'SELLER', 'ADMIN']} />,
      },
      {
        path: '/client',
        element: (
          <WithAuth c={<ClientPage />} roles={['BUYER', 'SELLER', 'ADMIN']} />
        ),
      },
      {
        path: '/worker',
        element: (
          <WithAuth c={<WorkerPage />} roles={['BUYER', 'SELLER', 'ADMIN']} />
        ),
      },
      {
        path: '/courier',
        element: (
          <WithAuth c={<CourierPage />} roles={['BUYER', 'SELLER', 'ADMIN']} />
        ),
      },
      {
        path: '/postomat',
        element: (
          <WithAuth c={<PostomatPage />} roles={['BUYER', 'SELLER', 'ADMIN']} />
        ),
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
    <ToastContainer theme="colored" />
  </ThemeProvider>
)
