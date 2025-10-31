import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Register() {
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
          <TextField label="Имя" variant="outlined" fullWidth />
          <TextField label="Email" variant="outlined" fullWidth />
          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
          />
          <Link to="/app" style={{ textDecoration: 'none' }}>
            <Button fullWidth variant="contained" sx={{ bgcolor: '#6f2dbd' }}>
              Зарегистрироваться
            </Button>
          </Link>
        </Stack>
      </Paper>
    </Box>
  )
}
