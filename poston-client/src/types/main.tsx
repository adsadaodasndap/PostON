import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import './index.css'
import App from './App'
import Login from './Login'
import Register from './Register'
import './i18n'
import ClientPage from './ClientPage'
import WorkerPage from './WorkerPage'
import CourierPage from './CourierPage'
import PostomatPage from './PostomatPage'

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/reg', element: <Register /> },
  { path: '/app', element: <App /> },

  { path: '/client', element: <ClientPage /> },
  { path: '/worker', element: <WorkerPage /> },
  { path: '/courier', element: <CourierPage /> },
  { path: '/postomat', element: <PostomatPage /> },
])

const theme = createTheme({
  palette: {
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
  </ThemeProvider>
)
