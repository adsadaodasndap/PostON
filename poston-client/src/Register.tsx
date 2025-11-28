import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from './http/API'
import { useState } from 'react'
import { useUser } from './context/user/useUser'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const { login } = useUser()
  const navigate = useNavigate()
  const submitSignUp = async () => {
    const res = await signUp(firstName, lastName, email, password)

    if (res.token) {
      login(res.user, res.token)
      navigate('/app')
    }
  }

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
          Регистрация
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Имя"
            variant="outlined"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <TextField
            label="Фамилия"
            variant="outlined"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

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
            onClick={submitSignUp}
            fullWidth
            variant="contained"
            sx={{ bgcolor: '#6f2dbd' }}
          >
            Зарегистрироваться
          </Button>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button fullWidth>Войти</Button>
          </Link>
        </Stack>
      </Paper>
    </Box>
  )
}
