import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import { signIn } from '../http/API'
import { useUser } from '../context/user/useUser'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return

    const eMail = email.trim()
    const pass = password

    if (!eMail || !pass) return

    try {
      setLoading(true)

      const res = await signIn(eMail, pass)

      // 🔴 TS fix + runtime fix: signIn может вернуть undefined
      if (!res?.token) return

      login(res.user, res.token)

      // Роутинг по роли (если у тебя другая логика — меняешь здесь)
      if (res.user.role === 'POSTAMAT') {
        navigate('/postomat')
        return
      }

      // дефолт — на главную/продукты
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Вход
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: 'grid', gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            fullWidth
          />

          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate('/register')}
            disabled={loading}
          >
            Нет аккаунта? Регистрация
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default Login
