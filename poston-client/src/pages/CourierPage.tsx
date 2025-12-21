import * as React from 'react'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import type { Purchase } from '../types'
import {
  getPurchases,
  markPurchaseDelivered,
  markPurchasePlaced,
} from '../http/API'
import { toast } from 'react-toastify'
import { useUser } from '../context/user/useUser'

function isFinishedForCourier(p: any) {
  if (p.delivery_type === 'COURIER' && p.courier_mode === 'POSTOMAT') {
    return Boolean(p.date_send)
  }
  return Boolean(p.date_receive)
}

export default function CourierPage() {
  const { user } = useUser()
  const [purchases, setPurchases] = React.useState<Purchase[]>([])
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const r = await getPurchases()
      if (r?.purchases) setPurchases(r.purchases)
    } catch (e) {
      console.log(e)
      toast.error('Не удалось загрузить доставки')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const active = purchases.filter((p: any) => !isFinishedForCourier(p))
  const finished = purchases.filter((p: any) => isFinishedForCourier(p))

  const label = (p: any) => {
    if (p.delivery_type !== 'COURIER') return 'Не курьерская'
    return p.courier_mode === 'POSTOMAT'
      ? 'Курьером в постомат'
      : 'Доставка до двери'
  }

  const handleDeliveredToClient = async (id: number) => {
    const r = await markPurchaseDelivered(id)
    if (r) await load()
  }

  const handlePlacedToPostomat = async (id: number) => {
    const r = await markPurchasePlaced(id)
    if (r) await load()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7f7f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: 900,
          width: '100%',
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Интерфейс курьера
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Текущий курьер: {user.name || user.email}{' '}
          {loading ? '(загрузка...)' : ''}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Активные задания
        </Typography>

        {active.length === 0 && (
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            Активных доставок нет.
          </Typography>
        )}

        {active.length > 0 && (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {active.map((p: any) => (
              <Paper
                key={p.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={600}>
                    Покупка №{p.id} {p.product ? `– ${p.product.name}` : ''}
                  </Typography>
                  <Chip
                    size="small"
                    label={label(p)}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                {p.buyer && (
                  <Typography variant="body2" color="text.secondary">
                    Получатель: {p.buyer.name}{' '}
                    {p.buyer.phone ? `(${p.buyer.phone})` : ''}
                  </Typography>
                )}

                {p.courier_mode === 'POSTOMAT' && p.postomat && (
                  <Typography variant="body2" color="text.secondary">
                    Постамат: {p.postomat.adress}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {p.courier_mode !== 'POSTOMAT' && (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#6f2dbd' }}
                      onClick={() => handleDeliveredToClient(p.id)}
                    >
                      Доставлено клиенту
                    </Button>
                  )}

                  {p.courier_mode === 'POSTOMAT' && (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#6f2dbd' }}
                      onClick={() => handlePlacedToPostomat(p.id)}
                    >
                      Положено в постамат
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Завершённые доставки
        </Typography>

        {finished.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            Завершённых доставок ещё нет.
          </Typography>
        )}

        {finished.length > 0 && (
          <Stack spacing={1.5}>
            {finished.map((p: any) => (
              <Paper
                key={p.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={600}>
                    Покупка №{p.id} {p.product ? `– ${p.product.name}` : ''}
                  </Typography>
                  <Chip
                    size="small"
                    label="Завершено"
                    color="success"
                    variant="outlined"
                  />
                </Stack>

                {p.courier_mode === 'POSTOMAT' && p.postomat && (
                  <Typography variant="body2" color="text.secondary">
                    Положено в постамат: {p.postomat.adress}
                  </Typography>
                )}

                {p.courier_mode !== 'POSTOMAT' && (
                  <Typography variant="body2" color="text.secondary">
                    Доставлено клиенту
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
