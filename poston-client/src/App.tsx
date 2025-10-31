import * as React from 'react'
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Paper,
  Toolbar,
  Typography,
  Stack,
} from '@mui/material'

type Parcel = {
  id: number
  title: string
  from: string
  status: 'в отделении' | 'забрана'
}

export default function App() {
  const [parcels, setParcels] = React.useState<Parcel[]>([
    { id: 1, title: 'Post#1', from: 'Post#1', status: 'в отделении' },
    { id: 2, title: 'Документы', from: 'KZ Courier', status: 'в отделении' },
    { id: 3, title: 'Подарок', from: 'Ильяс', status: 'забрана' },
  ])

  const pickup = (id: number) => {
    setParcels((list) =>
      list.map((p) => (p.id === id ? { ...p, status: 'забрана' } : p))
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f7f7f9',
      }}
    >
      <CssBaseline />
      <AppBar position="static" sx={{ bgcolor: '#6f2dbd' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            PostON — мои посылки
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 600,
            textAlign: 'center',
            borderRadius: 4,
            boxShadow: 6,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Ваши посылки
          </Typography>

          <Stack spacing={2}>
            {parcels.map((p) => (
              <Paper
                key={p.id}
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft:
                    p.status === 'забрана'
                      ? '5px solid green'
                      : '5px solid #6f2dbd',
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6">{p.title}</Typography>
                  <Typography sx={{ color: '#555', fontSize: 14 }}>
                    Отправитель: {p.from}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      color: p.status === 'забрана' ? 'green' : '#6f2dbd',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    Статус: {p.status}
                  </Typography>
                </Box>
                {p.status !== 'забрана' && (
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#6f2dbd' }}
                    onClick={() => pickup(p.id)}
                  >
                    Забрать
                  </Button>
                )}
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}
