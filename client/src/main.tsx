// main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

import Login from './Login'
import Register from './Register'
import App from './App'
import BasicGrid from './drawer'
import Admin from './Admin'
import User from './User'
import Worker from './Worker'
import Courier from './Courier'
import Locker from './Locker'

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
  {
    path: '/worker',
    element: <Worker />,
  },
  {
    path: '/courier',
    element: <Courier />,
  },
  {
    path: '/locker',
    element: <Locker />,
  },
])

// тема в фиолетовом цвете (#6f2dbd) — как ты просил
const theme = createTheme({
  palette: {
    primary: {
      main: '#6f2dbd',
    },
    secondary: {
      main: '#f3c623',
    },
    background: {
      default: '#f7f7f9',
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
})

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
    <ToastContainer theme="colored" position="bottom-right" />
  </ThemeProvider>
)
