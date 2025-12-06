import AccountCircle from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MailIcon from '@mui/icons-material/Mail'
import MoreIcon from '@mui/icons-material/MoreVert'
import NotificationsIcon from '@mui/icons-material/Notifications'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Button, Checkbox, Paper, Stack, SwipeableDrawer } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useUser } from '../context/user/useUser'
import type { CartItem } from '../types/CartItem'
import { Link, useNavigate } from 'react-router-dom'

export default function TopBar() {
  const navigate = useNavigate()
  const { user, cart, setCart, cartOpen, setCartOpen } = useUser()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  )

  const mobileMenuId = 'primary-search-account-menu-mobile'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton size="large" color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  )

  const deleteItem = (prod: CartItem) => {
    setCart(cart.filter((p) => p.id !== prod.id))
  }

  const changeAmount = (prod: CartItem, amount: number) => {
    const ix = cart.findIndex((p) => p.id === prod.id)

    const _cart = structuredClone(cart)

    const newAmount = _cart[ix].amount + amount

    if (newAmount === 6) {
      toast.info('Достигнуто максимальное количество!')
      return
    }

    if (newAmount === 0) {
      deleteItem(prod)
    } else {
      _cart[ix].amount = newAmount
      setCart(_cart)
    }
  }

  const totalAmount = useMemo(
    () =>
      cart.reduce((prev, cur) => {
        prev += cur.amount * cur.price
        return prev
      }, 0),
    [cart]
  )

  return (
    <Box sx={{ flexGrow: 1, width: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
            <LocalShippingIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            fontWeight={700}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            PostVON
          </Typography>

          <Link to="/products">
            <Button sx={{ ml: 3, color: 'white' }}>Каталог</Button>
          </Link>
          {user.role === 'BUYER' && (
            <Link to="/client">
              <Button sx={{ color: 'white' }}>Посылки</Button>
            </Link>
          )}
          {user.role === 'COURIER' && (
            <Link to="/courier">
              <Button sx={{ color: 'white' }}>Доставки</Button>
            </Link>
          )}
          <Link to="/worker">
            <Button sx={{ color: 'white' }}>Прием товара</Button>
          </Link>
          {user.role === 'ADMIN' && (
            <Link to="/admin">
              <Button sx={{ color: 'white' }}>Админ-панель</Button>
            </Link>
          )}

          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="large"
            color="inherit"
            onClick={() => setCartOpen(true)}
          >
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <Stack direction={'row'} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Link to="/profile">
              <Button variant="contained" startIcon={<AccountCircle />}>
                {user.email}
              </Button>
            </Link>
          </Stack>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <SwipeableDrawer
        anchor="right"
        open={cartOpen}
        onOpen={() => setCartOpen(true)}
        onClose={() => setCartOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            minWidth: 370,
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{ mx: 2, mb: 4, mt: 2 }}
          textAlign={'center'}
        >
          Ваша корзина
        </Typography>
        {cart.length === 0 && (
          <Stack alignItems={'center'}>
            {/* <AddShoppingCartIcon sx={{ fontSize: 71 }} /> */}
            <Typography sx={{ fontSize: 71 }}>😔</Typography>

            <Typography variant="h6">
              Жаль, что вы ничего не купили...
            </Typography>
            <Typography variant="body2">Посмотрите наш каталог!</Typography>
            <Button
              onClick={() => navigate('/products')}
              variant="contained"
              sx={{ mt: 2, width: 0.8 }}
            >
              Начать покупки
            </Button>
          </Stack>
        )}
        <Stack height={1}>
          {cart.map((p) => (
            <Paper
              component={Stack}
              alignItems={'center'}
              mt={2}
              mx={4}
              p={1.5}
              elevation={6}
            >
              <Typography sx={{ mr: 3, mb: 1 }}>{p.name}</Typography>
              <Stack direction={'row'} alignItems={'center'}>
                <Checkbox sx={{ mr: 1 }} />
                <Paper
                  component={Stack}
                  direction={'row'}
                  alignItems={'center'}
                  sx={{ mr: 3 }}
                >
                  <IconButton onClick={() => changeAmount(p, -1)}>
                    <RemoveIcon />
                  </IconButton>
                  <Typography>{p.amount}</Typography>
                  <IconButton onClick={() => changeAmount(p, 1)}>
                    <AddIcon />
                  </IconButton>
                </Paper>
                <Typography>{p.price} тг</Typography>
                <IconButton sx={{ ml: 2 }} onClick={() => deleteItem(p)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Stack>
            </Paper>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Typography textAlign={'center'} variant="h5" mb={3}>
            Итого: {totalAmount} тг
          </Typography>
        </Stack>
      </SwipeableDrawer>
    </Box>
  )
}
