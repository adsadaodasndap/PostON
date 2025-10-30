import * as React from 'react'
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Divider,
  Select,
  MenuItem,
} from '@mui/material'
import { toast } from 'react-toastify'

type Parcel = {
  id: number
  from: string
  to: string
  status: string
}

export default function WorkerPage() {
  const [parcels, setParcels] = React.useState<Parcel[]>([
    { id: 1, from: 'Алия', to: 'Наиль', status: 'в отделении' },
    { id: 2, from: 'Магазин OZON', to: 'Руслан', status: 'у курьера' },
  ])
  const [selected, setSelected] = React.useState('')

  const transfer = (id: number) => {
    setParcels((p) =>
      p.map((x) =>
        x.id === id ? { ...x, status: selected || 'у курьера' } : x
      )
    )
    toast.success('Посылка передана!')
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Посылки в отделении
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
            <Select
              size="small"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              displayEmpty
            >
              <MenuItem value="у курьера">Передать курьеру</MenuItem>
              <MenuItem value="пользователю">Выдать пользователю</MenuItem>
            </Select>
            <Button
              variant="contained"
              disabled={!selected}
              onClick={() => transfer(p.id)}
            >
              Подтвердить
            </Button>
          </Stack>
        </Box>
      ))}
    </Paper>
  )
}
