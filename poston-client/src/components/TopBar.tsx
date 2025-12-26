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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputLabel,
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
import type { SelectChangeEvent } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUser } from '../context/user/useUser'
import type { CartItem } from '../types/CartItem'
import { confirmEmail, createPurchase, getCouriers } from '../http/API'

type CourierDTO = {
  id: number
  name: string
}

function normalizeCouriers(input: unknown): CourierDTO[] {
  if (Array.isArray(input)) {
    return input
      .map((x) => {
        const o = x as Partial<CourierDTO>
        if (typeof o?.id !== 'number') return null
        if (typeof o?.name !== 'string') return null
        return { id: o.id, name: o.name }
      })
      .filter((v): v is CourierDTO => v !== null)
  }

  const obj = input as { couriers?: unknown }
  if (obj && Array.isArray(obj.couriers)) return normalizeCouriers(obj.couriers)

  return []
}

export default function TopBar() {
  const navigate = useNavigate()
  const { user, cart, setUser, setCart, cartOpen, setCartOpen } = useUser()

  const [searchParams, setSearchParams] = useSearchParams()

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [couriersLoading, setCouriersLoading] = useState(false)
  const [couriers, setCouriers] = useState<CourierDTO[]>([])
  const [courierId, setCourierId] = useState<number | null>(null)
  const [courierMode, setCourierMode] = useState<'HOME' | 'POSTOMAT'>('HOME')
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const isAuth = Boolean(user?.role)
  const hideTopbar = user?.role === 'POSTAMAT'

  useEffect(() => {
    if (isAuth) return
    setAnchorEl(null)
    setMobileMoreAnchorEl(null)
    setCheckoutOpen(false)
    setCourierId(null)
    setCourierMode('HOME')
    setCouriers([])
    setCouriersLoading(false)
    setCheckoutSubmitting(false)
    setCartOpen(false)
  }, [isAuth, setCartOpen])

  useEffect(() => {
    const secret = searchParams.get('secret')
    if (!secret) return

    confirmEmail(secret)
      .then((res) => {
        const ok =
          typeof res === 'boolean'
            ? res
            : Boolean((res as { message?: unknown } | undefined)?.message)

        if (!ok) return

        setUser((prev) => ({ ...prev, active: true }))
      })
      .finally(() => {
        setSearchParams({})
      })
  }, [searchParams, setUser, setSearchParams])

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

  const totalPrice = useMemo(() => {
    let sum = 0
    for (const item of cart) sum += item.price * item.amount
    return sum
  }, [cart])

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((x) => x.id !== id))
  }

  const incAmount = (id: number) => {
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, amount: x.amount + 1 } : x))
    )
  }

  const decAmount = (id: number) => {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, amount: x.amount - 1 } : x))
        .filter((x) => x.amount > 0)
    )
  }

  const openCheckout = async () => {
    if (!isAuth || user.role !== 'BUYER') {
      toast.error('Требуется аккаунт покупателя (BUYER)')
      return
    }

    if (!cart.length) {
      toast.error('Корзина пуста')
      return
    }

    try {
      setCouriersLoading(true)
      const res = await getCouriers()
      const list = normalizeCouriers(res)
      setCouriers(list)
      setCheckoutOpen(true)
    } catch (e) {
      console.log(e)
      setCouriers([])
      toast.error('Не удалось загрузить курьеров')
    } finally {
      setCouriersLoading(false)
    }
  }

  const closeCheckout = () => {
    setCheckoutOpen(false)
    setCourierId(null)
    setCourierMode('HOME')
  }

  const submitCheckout = async () => {
    if (!isAuth || user.role !== 'BUYER') {
      toast.error('Требуется аккаунт покупателя (BUYER)')
      return
    }

    if (courierId === null) {
      toast.error('Выберите курьера')
      return
    }

    try {
      setCheckoutSubmitting(true)

      for (const item of cart as CartItem[]) {
        for (let k = 0; k < item.amount; k++) {
          await createPurchase({
            productId: item.id,
            deliveryType: 'COURIER',
            courierId,
            courierMode,
          })
        }
      }

      toast.success('Доставка оформлена')
      setCart([])
      closeCheckout()
      setCartOpen(false)
    } catch (e) {
      console.log(e)
      toast.error('Не удалось оформить доставку')
    } finally {
      setCheckoutSubmitting(false)
    }
  }

  const handleCourierChange = (e: SelectChangeEvent) => {
    const v = e.target.value
    if (!v) {
      setCourierId(null)
      return
    }
    const id = Number(v)
    if (Number.isNaN(id)) {
      setCourierId(null)
      return
    }
    setCourierId(id)
  }

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="primary-search-account-menu"
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={() => {
          handleMenuClose()
          navigate('/profile')
        }}
      >
        Профиль
      </MenuItem>
    </Menu>
  )

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="primary-search-account-menu-mobile"
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

  if (hideTopbar) return null

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

          {isAuth ? (
            <>
              <Link to="/products">
                <Button sx={{ ml: 3, color: 'white' }}>Каталог</Button>
              </Link>

              {user.role === 'BUYER' && (
                <Link to="/postomat">
                  <Button sx={{ ml: 2, color: 'white' }}>
                    Забрать посылку
                  </Button>
                </Link>
              )}

              {(user.role === 'COURIER' || user.role === 'ADMIN') && (
                <Link to="/postomat">
                  <Button sx={{ ml: 2, color: 'white' }}>Постамат</Button>
                </Link>
              )}

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
            </>
          ) : (
            <>
              <Button
                sx={{ ml: 3, color: 'white' }}
                onClick={() => navigate('/auth')}
              >
                Войти
              </Button>
              <Button
                sx={{ ml: 1, color: 'white' }}
                onClick={() => navigate('/register')}
              >
                Регистрация
              </Button>
            </>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            size="large"
            color="inherit"
            onClick={() => setCartOpen(true)}
            disabled={!isAuth}
          >
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {isAuth && (
            <Stack direction="row" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Link to="/profile">
                <Button variant="contained" startIcon={<AccountCircle />}>
                  {user.email}
                </Button>
              </Link>
            </Stack>
          )}

          {isAuth && (
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isAuth ? (
        <>
          {renderMobileMenu}
          {renderMenu}
        </>
      ) : null}

      <Dialog open={checkoutOpen} onClose={closeCheckout} fullWidth>
        <DialogTitle>Оформление курьерской доставки</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <FormControl sx={{ mt: 1 }} fullWidth>
            <InputLabel id="courier-select-label">Курьер</InputLabel>
            <Select
              labelId="courier-select-label"
              label="Курьер"
              value={courierId === null ? '' : String(courierId)}
              onChange={handleCourierChange}
              disabled={couriersLoading}
            >
              {couriers.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  #{c.id} — {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Режим доставки</FormLabel>
            <RadioGroup
              value={courierMode}
              onChange={(e) =>
                setCourierMode(e.target.value as 'HOME' | 'POSTOMAT')
              }
            >
              <FormControlLabel
                value="HOME"
                control={<Radio />}
                label="До двери"
              />
              <FormControlLabel
                value="POSTOMAT"
                control={<Radio />}
                label="В постамат"
              />
            </RadioGroup>
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
            Оформить
          </Button>
        </DialogActions>
      </Dialog>

      <SwipeableDrawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOpen={() => setCartOpen(true)}
        disableSwipeToOpen
      >
        <Box sx={{ width: 420, p: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Корзина
          </Typography>

          {!cart.length ? (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Корзина пуста
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {cart.map((item: CartItem) => (
                <Paper key={item.id} sx={{ p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={700}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Number(item.price).toFixed(2)} ₸
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 1 }}
                  >
                    <IconButton size="small" onClick={() => decAmount(item.id)}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography fontWeight={700}>{item.amount}</Typography>
                    <IconButton size="small" onClick={() => incAmount(item.id)}>
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}

              <Box sx={{ pt: 1 }}>
                <Typography fontWeight={700}>
                  Итого: {totalPrice.toFixed(2)} ₸
                </Typography>
              </Box>

              {user.role === 'BUYER' ? (
                <Button variant="contained" onClick={openCheckout}>
                  Оформить доставку
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Оформление доступно только покупателю (BUYER)
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </SwipeableDrawer>
    </Box>
  )
}
