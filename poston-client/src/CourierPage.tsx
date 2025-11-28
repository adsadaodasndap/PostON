import * as React from 'react'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import type { Purchase, User } from './types'

const currentCourier: User = {
  id: 10,
  name: 'Курьер Аскар',
  role: 'COURIER',
  phone: '+77011111111',
  email: 'askar@example.com',
}

const mockCourierPurchases: Purchase[] = [
  {
    id: 1,
    user_id: 1,
    product_id: 1,
    date_buy: '2025-10-01T12:00:00Z',
    date_send: '2025-10-02T10:00:00Z',
    delivery_type: 'COURIER',
    courier_id: 10,
    product: {
      id: 1,
      name: 'Кроссовки',
      cost: 45000,
      length: 30,
      width: 20,
      height: 12,
      weight: 0.8,
    },
    buyer: {
      id: 1,
      name: 'Покупатель 1',
      role: 'BUYER',
      phone: '+77030000001',
      email: 'client1@example.com',
    },
  },
  {
    id: 2,
    user_id: 2,
    product_id: 2,
    date_buy: '2025-10-02T10:00:00Z',
    date_send: '2025-10-03T09:00:00Z',
    delivery_type: 'POSTOMAT',
    courier_id: 10,
    postomat_id: 1,
    postomat_slot: 5,
    product: {
      id: 2,
      name: 'Наушники',
      cost: 25000,
      length: 15,
      width: 15,
      height: 10,
      weight: 0.3,
    },
    postomat: { id: 1, adress: 'Постамат ТЦ «Mega»', lat: 49.97, lon: 82.61 },
  },
]

function isFinished(p: Purchase) {
  return Boolean(p.date_receive)
}

export default function CourierPage() {
  const [purchases, setPurchases] =
    React.useState<Purchase[]>(mockCourierPurchases)

  const active = purchases.filter((p) => !isFinished(p))
  const finished = purchases.filter((p) => isFinished(p))

  const handleDeliveredToClient = (purchaseId: number) => {
    const now = new Date().toISOString()
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              date_receive: now,
            }
          : p
      )
    )
  }

  const handlePlacedToPostomat = (purchaseId: number) => {
    const now = new Date().toISOString()
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              date_send: p.date_send ?? now,
              date_receive: now,
            }
          : p
      )
    )
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
          Текущий курьер: {currentCourier.name}
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
            {active.map((p) => (
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
                    label={
                      p.delivery_type === 'COURIER'
                        ? 'Доставка до двери'
                        : 'Доставка в постамат'
                    }
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

                {p.delivery_type === 'POSTOMAT' && p.postomat && (
                  <Typography variant="body2" color="text.secondary">
                    Постамат: {p.postomat.adress}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {p.delivery_type === 'COURIER' && (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#6f2dbd' }}
                      onClick={() => handleDeliveredToClient(p.id)}
                    >
                      Доставлено клиенту
                    </Button>
                  )}
                  {p.delivery_type === 'POSTOMAT' && (
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
            {finished.map((p) => (
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
                {p.delivery_type === 'COURIER' && (
                  <Typography variant="body2" color="text.secondary">
                    Доставлено клиенту
                  </Typography>
                )}
                {p.delivery_type === 'POSTOMAT' && p.postomat && (
                  <Typography variant="body2" color="text.secondary">
                    Доставлено в постамат: {p.postomat.adress}
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
