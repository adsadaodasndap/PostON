import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../http/API'
import { useUser } from '../context/user/useUser'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, login } = useUser()
  const navigate = useNavigate()
  const submitSignIn = async () => {
    const res = await signIn(email, password)

    if (res.token) {
      login(res.user, res.token)
      navigate('/products')
    }
  }

  useEffect(() => {
    if (user.role) {
      navigate('/products')
    }
  }, [user])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f7f7f9',
      }}
    >
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 360,
          width: '100%',
          boxShadow: 6,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Вход в PostON
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            onClick={submitSignIn}
            fullWidth
            variant="contained"
            sx={{ bgcolor: '#6f2dbd' }}
          >
            Войти
          </Button>

          <Link to="/reg" style={{ textDecoration: 'none' }}>
            <Button fullWidth>Регистрация</Button>
          </Link>
        </Stack>
      </Paper>
    </Box>
  )
}
