import * as React from 'react'
import {
  Box,
  Button,
  Rating,
  Stack,
  TextField,
  Typography,
  Paper,
} from '@mui/material'
import { toast } from 'react-toastify'

export default function UserPage() {
  const [courierRate, setCourierRate] = React.useState<number | null>(0)
  const [lockerRate, setLockerRate] = React.useState<number | null>(0)
  const [productRate, setProductRate] = React.useState<number | null>(0)
  const [comment, setComment] = React.useState('')

  const submit = () => {
    if (!courierRate || !lockerRate || !productRate) {
      toast.error('Поставьте все оценки!')
      return
    }
    toast.success('Спасибо за отзыв!')
    setComment('')
    setCourierRate(0)
    setLockerRate(0)
    setProductRate(0)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Оцените доставку
      </Typography>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <Box>
          <Typography>Курьер</Typography>
          <Rating value={courierRate} onChange={(_, v) => setCourierRate(v)} />
        </Box>
        <Box>
          <Typography>Постамат</Typography>
          <Rating value={lockerRate} onChange={(_, v) => setLockerRate(v)} />
        </Box>
        <Box>
          <Typography>Товар</Typography>
          <Rating value={productRate} onChange={(_, v) => setProductRate(v)} />
        </Box>
        <TextField
          label="Комментарий"
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button variant="contained" onClick={submit}>
          Отправить отзыв
        </Button>
      </Stack>
    </Paper>
  )
}
