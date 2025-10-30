// App.tsx
import * as React from 'react'
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
} from '@mui/material'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import InventoryIcon from '@mui/icons-material/Inventory'
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike'
import QrCodeIcon from '@mui/icons-material/QrCode'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import UserPage from './User'
import WorkerPage from './Worker'
import CourierPage from './Courier'
import LockerPage from './Locker'
import AdminPage from './Admin'

const drawerWidth = 260

function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const navigate = useNavigate()

  const menu = [
    { text: 'Пользователь', icon: <PersonIcon />, path: '/user' },
    { text: 'Рабочий', icon: <InventoryIcon />, path: '/worker' },
    { text: 'Курьер', icon: <DirectionsBikeIcon />, path: '/courier' },
    { text: 'Админ', icon: <AdminPanelSettingsIcon />, path: '/admin' },
  ]

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ mx: 'auto', color: '#6f2dbd', fontWeight: 700 }}
        >
          PostON
        </Typography>
      </Toolbar>
      <List>
        {menu.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ bgcolor: '#6f2dbd' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Почтовое отделение PostON
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Routes>
          <Route path="/user" element={<UserPage />} />
          <Route path="/worker" element={<WorkerPage />} />
          <Route path="/courier" element={<CourierPage />} />
          <Route path="/locker" element={<LockerPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <ToastContainer theme="colored" />
      </Box>
    </Box>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
