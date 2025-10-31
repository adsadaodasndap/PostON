import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Login() {
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
          <TextField label="Логин" variant="outlined" fullWidth />
          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
          />
          <Link to="/app" style={{ textDecoration: 'none' }}>
            <Button fullWidth variant="contained" sx={{ bgcolor: '#6f2dbd' }}>
              Войти
            </Button>
          </Link>
          <Link to="/reg" style={{ textDecoration: 'none' }}>
            <Button fullWidth>Регистрация</Button>
          </Link>
        </Stack>
      </Paper>
    </Box>
  )
}
