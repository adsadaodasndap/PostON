import * as React from 'react'
import { Box, Button, Paper, Typography, Stack, Divider } from '@mui/material'
import { toast } from 'react-toastify'

type Parcel = {
  id: number
  from: string
  to: string
  status: string
}

export default function CourierPage() {
  const [parcels, setParcels] = React.useState<Parcel[]>([
    { id: 1, from: 'Алия', to: 'Наиль', status: 'у курьера' },
    { id: 2, from: 'Магазин OZON', to: 'Руслан', status: 'в пути' },
  ])

  const deliver = (id: number) => {
    setParcels((p) =>
      p.map((x) => (x.id === id ? { ...x, status: 'доставлено' } : x))
    )
    toast.success('Посылка доставлена!')
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Курьер — мои посылки
      </Typography>
      {parcels.map((p) => (
        <Box key={p.id} sx={{ my: 2, border: '1px solid #ccc', p: 2 }}>
          <Typography>
            #{p.id}: {p.from} → {p.to}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Статус: {p.status}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={p.status === 'доставлено'}
              onClick={() => deliver(p.id)}
            >
              Доставлено
            </Button>
          </Stack>
        </Box>
      ))}
    </Paper>
  )
}
