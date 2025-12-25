import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/user/useUser'

export default function TopBar() {
  const navigate = useNavigate()
  const { user, logout } = useUser()

  // Терминалу POSTAMAT топбар не показываем
  if (user?.role === 'POSTAMAT') return null

  const isAuthed = Boolean(user)
  const role = user?.role

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          PostVON
        </Typography>

        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          <Link to="/products" style={{ textDecoration: 'none' }}>
            <Button sx={{ ml: 2, color: 'white' }}>Каталог</Button>
          </Link>

          {(role === 'COURIER' || role === 'ADMIN') && (
            <Link to="/postomat" style={{ textDecoration: 'none' }}>
              <Button sx={{ ml: 2, color: 'white' }}>Постамат</Button>
            </Link>
          )}

          {role === 'BUYER' && (
            <Link to="/postomat" style={{ textDecoration: 'none' }}>
              <Button sx={{ ml: 2, color: 'white' }}>Забрать посылку</Button>
            </Link>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {!isAuthed ? (
          <Link to="/auth" style={{ textDecoration: 'none' }}>
            <Button sx={{ color: 'white' }}>Войти</Button>
          </Link>
        ) : (
          <Button onClick={handleLogout} sx={{ color: 'white' }}>
            Выйти
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
