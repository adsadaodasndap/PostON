import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/user/useUser'

export default function Checkout() {
  const { cart, setCart } = useUser()
  const navigate = useNavigate()

  const totalAmount = cart.reduce((sum, p) => sum + p.amount * p.price, 0)

  const handleConfirm = () => {
    alert('Заказ оформлен!')
    setCart([])
    navigate('/products')
  }

  if (cart.length === 0) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5">Корзина пуста 😔</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/products')}
        >
          Перейти в каталог
        </Button>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} textAlign="center">
        Оформление заказа
      </Typography>
      <Stack spacing={2}>
        {cart.map((p) => (
          <Paper key={p.id} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography>{p.name}</Typography>
              <Typography>
                {p.amount} x {p.price} тг
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
      <Typography variant="h5" textAlign="center" mt={3}>
        Итого: {totalAmount} тг
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, display: 'block', mx: 'auto' }}
        onClick={handleConfirm}
      >
        Подтвердить заказ
      </Button>
    </Box>
  )
}
