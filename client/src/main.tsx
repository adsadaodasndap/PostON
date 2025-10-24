import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import './index.css'
import Login from './Login'
import Register from './Register'
import App from './App'
import React from 'react'
import BasicGrid from './drawer'
import Admin from './Admin'
import User from './User'
const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/reg',
    element: <Register />,
  },
  {
    path: '/app',
    element: <App />,
  },
  {
    path: '/grid',
    element: <BasicGrid />,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '/user',
    element: <User />,
  },
])
const theme = createTheme({
  palette: {
    primary: {
      main: 'rgba(255, 0, 0, 1)',
    },
    secondary: {
      main: 'rgba(255, 0, 255, 1)',
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
    <ToastContainer theme="colored" />
  </ThemeProvider>
)
