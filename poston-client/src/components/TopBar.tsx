import AccountCircle from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MailIcon from '@mui/icons-material/Mail'
import MoreIcon from '@mui/icons-material/MoreVert'
import NotificationsIcon from '@mui/icons-material/Notifications'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  SwipeableDrawer,
  Toolbar,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUser } from '../context/user/useUser'
import type { CartItem } from '../types/CartItem'
import { confirmEmail, createPurchase, getCouriers } from '../http/API'

type CourierDTO = { id: number; name: string; email: string }

export default function TopBar() {
  const navigate = useNavigate()
  const { user, cart, setUser, setCart, cartOpen, setCartOpen } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [couriers, setCouriers] = useState<CourierDTO[]>([])
const [courierId, setCourierId] = useState<number | null>(null)
  const [courierMode, setCourierMode] = useState<'HOME' | 'POSTOMAT'>('HOME')
  const [couriersLoading, setCouriersLoading] = useState(false)
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)

  const totalAmount = useMemo(
    () =>
      cart.reduce((prev, cur) => {
        prev += cur.amount * cur.price
        return prev
      }, 0),
    [cart]
  )

  useEffect(() => {
    const secret = searchParams.get('secret')
    if (!secret) return
    console.log(setSearchParams)

    confirmEmail(secret).then((isConfirmed: boolean) => {
      if (!isConfirmed) return
      setUser((prev) => ({ ...prev, active: true }))
    })
  }, [searchParams, setUser, setSearchParams])

  if (user.role === 'POSTAMAT') return null

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

  const openCheckout = async () => {
    if (cart.length === 0) return

    setCheckoutOpen(true)
    setCourierId('')
    setCourierMode('HOME')

    try {
      setCouriersLoading(true)
      const r = await getCouriers()
      if (r?.couriers) {
        setCouriers(r.couriers)
      } else {
        setCouriers([])
        toast.error('Не удалось получить список курьеров')
      }
    } catch (e) {
      console.log(e)
      setCouriers([])
      toast.error('Ошибка получения курьеров')
    } finally {
      setCouriersLoading(false)
    }
  }

  const closeCheckout = () => {
    if (checkoutSubmitting) return
    setCheckoutOpen(false)
  }

  const submitCheckout = async () => {
    if (!courierId) {
      toast.error('Выберите курьера')
      return
    }

    try {
      setCheckoutSubmitting(true)

      for (const item of cart) {
        for (let k = 0; k < item.amount; k++) {
          const r = await createPurchase({
            productId: item.id,
            deliveryType: 'COURIER',
            courierId: Number(courierId),
            courierMode,
          })
          if (!r) throw new Error('Не удалось создать заказ')
        }
      }

      setCart([])
      setCartOpen(false)
      setCheckoutOpen(false)
      navigate('/client')
    } catch (e) {
      console.log(e)
      toast.error('Ошибка оформления заказа')
    } finally {
      setCheckoutSubmitting(false)
    }
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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

          {user.role === 'BUYER' && (
            <Link to="/assistant">
              <Button sx={{ ml: 2, color: 'white' }}>AI Ассистент</Button>
            </Link>
          )}

          {user.role === 'COURIER' && (
            <Link to="/courier">
              <Button sx={{ color: 'white' }}>Доставки</Button>
            </Link>
          )}

          {user.role === 'SELLER' && (
            <Link to="/worker">
              <Button sx={{ color: 'white' }}>Прием товара</Button>
            </Link>
          )}

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

          <Stack direction="row" sx={{ display: { xs: 'none', md: 'flex' } }}>
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

      {/* Диалог выбора курьера / режима */}
      <Dialog open={checkoutOpen} onClose={closeCheckout} fullWidth>
        <DialogTitle>Оформление курьерской доставки</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <FormControl sx={{ mt: 1 }} fullWidth>
            <FormLabel>Куда доставить курьером?</FormLabel>
            <RadioGroup
              value={courierMode}
              onChange={(e) =>
                setCourierMode(e.target.value as 'HOME' | 'POSTOMAT')
              }
            >
              <FormControlLabel
                value="HOME"
                control={<Radio />}
                label="Доставка до дома"
              />
              <FormControlLabel
                value="POSTOMAT"
                control={<Radio />}
                label="Курьером в постомат"
              />
            </RadioGroup>
          </FormControl>

          <FormControl sx={{ mt: 2 }} fullWidth size="small">
            <FormLabel sx={{ mb: 1 }}>Выберите курьера</FormLabel>

            <Select
              value={courierId}
              onChange={(e) => {
                const v = e.target.value
                setCourierId(v === '' ? '' : Number(v))
              }}
              displayEmpty
              disabled={couriersLoading}
            >
              <MenuItem value="">
                <em>
                  {couriersLoading
                    ? 'Загрузка курьеров...'
                    : couriers.length === 0
                      ? 'Курьеров нет'
                      : 'Не выбран'}
                </em>
              </MenuItem>

              {couriers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  #{c.id} — {c.name} ({c.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeCheckout} disabled={checkoutSubmitting}>
            Отмена
          </Button>
          <Button
            variant="contained"
            disabled={checkoutSubmitting || couriersLoading}
            onClick={submitCheckout}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <SwipeableDrawer
        anchor="right"
        open={cartOpen}
        onOpen={() => setCartOpen(true)}
        onClose={() => setCartOpen(false)}
        sx={{ '& .MuiDrawer-paper': { minWidth: 370 } }}
      >
        <Typography
          variant="h6"
          sx={{ mx: 2, mb: 4, mt: 2 }}
          textAlign="center"
        >
          Ваша корзина
        </Typography>

        {cart.length === 0 && (
          <Stack alignItems="center">
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
              key={p.id}
              component={Stack}
              alignItems="center"
              mt={2}
              mx={4}
              p={1.5}
              elevation={6}
            >
              <Typography sx={{ mr: 3, mb: 1 }}>{p.name}</Typography>

              <Stack direction="row" alignItems="center">
                <Checkbox sx={{ mr: 1 }} />

                <Paper
                  component={Stack}
                  direction="row"
                  alignItems="center"
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

          <Typography textAlign="center" variant="h5" mb={3}>
            Итого: {totalAmount} тг
          </Typography>
          {cart.length > 0 && user.role === 'BUYER' && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mx: 4, mb: 4, width: 'calc(100% - 32px)' }}
              onClick={openCheckout}
            >
              Оформить заказ
            </Button>
          )}
        </Stack>
      </SwipeableDrawer>
    </Box>
  )
}
