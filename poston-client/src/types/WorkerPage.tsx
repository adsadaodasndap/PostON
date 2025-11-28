import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { Branch, Purchase, User } from './types'

type WorkerState = {
  branch: Branch
  couriers: User[]
  purchases: Purchase[]
}

const initialWorkerState: WorkerState = {
  branch: {
    id: 1,
    adress: 'Отделение №3, Оскемен',
    post_rating: 5,
  },
  couriers: [
    {
      id: 10,
      name: 'Курьер Аскар',
      role: 'COURIER',
      phone: '+77011111111',
      email: 'askar@example.com',
    },
    {
      id: 11,
      name: 'Курьер Дана',
      role: 'COURIER',
      phone: '+77022222222',
      email: 'dana@example.com',
    },
  ],
  purchases: [
    {
      id: 1,
      user_id: 1,
      product_id: 1,
      date_buy: '2025-10-01T12:00:00Z',
      date_send: undefined,
      delivery_type: 'COURIER',
      branch_id: 1,
      product: {
        id: 1,
        name: 'Кроссовки',
        cost: 45000,
        length: 30,
        width: 20,
        height: 12,
        weight: 0.8,
      },
      branch: { id: 1, adress: 'Отделение №3, Оскемен', post_rating: 5 },
    },
    {
      id: 2,
      user_id: 2,
      product_id: 2,
      date_buy: '2025-10-02T10:00:00Z',
      date_send: undefined,
      delivery_type: 'POSTOMAT',
      branch_id: 1,
      postomat_id: 1,
      postomat_slot: 1,
      product: {
        id: 2,
        name: 'Наушники',
        cost: 25000,
        length: 15,
        width: 15,
        height: 10,
        weight: 0.3,
      },
      branch: { id: 1, adress: 'Отделение №3, Оскемен', post_rating: 5 },
      postomat: { id: 1, adress: 'Постамат ТЦ «Mega»', lat: 49.97, lon: 82.61 },
    },
    {
      id: 3,
      user_id: 3,
      product_id: 3,
      date_buy: '2025-10-03T14:00:00Z',
      date_send: undefined,
      delivery_type: 'BRANCH',
      branch_id: 1,
      product: {
        id: 3,
        name: 'Футболка',
        cost: 8000,
        length: 25,
        width: 20,
        height: 3,
        weight: 0.2,
      },
      branch: { id: 1, adress: 'Отделение №3, Оскемен', post_rating: 5 },
    },
  ],
}

function formatDeliveryTarget(p: Purchase) {
  if (p.delivery_type === 'BRANCH') return 'Выдача на кассе'
  if (p.delivery_type === 'POSTOMAT') return 'Отправка в постамат'
  return 'Передача курьеру'
}

export default function WorkerPage() {
  const [state, setState] = React.useState<WorkerState>(initialWorkerState)
  const [selectedCourierId, setSelectedCourierId] = React.useState<number | ''>(
    ''
  )

  const handleAssignCourier = (purchaseId: number) => {
    if (selectedCourierId === '') return
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      purchases: prev.purchases.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              courier_id: selectedCourierId as number,
              date_send: now,
            }
          : p
      ),
    }))
  }

  const handleSendToPostomat = (purchaseId: number) => {
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      purchases: prev.purchases.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              date_send: now,
            }
          : p
      ),
    }))
  }

  const handleMarkAsGivenAtBranch = (purchaseId: number) => {
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      purchases: prev.purchases.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              date_send: now,
              date_receive: now,
            }
          : p
      ),
    }))
  }

  const purchasesInBranch = state.purchases

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
          maxWidth: 1000,
          width: '100%',
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Интерфейс консультанта отделения
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Отделение: {state.branch.adress}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <Typography variant="body2">Доступные курьеры:</Typography>
          <Select
            size="small"
            value={selectedCourierId}
            onChange={(e) =>
              setSelectedCourierId(e.target.value as number | '')
            }
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">
              <em>Не выбран</em>
            </MenuItem>
            {state.couriers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Посылки в отделении
        </Typography>

        {purchasesInBranch.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            В этом отделении нет посылок.
          </Typography>
        )}

        {purchasesInBranch.length > 0 && (
          <Stack spacing={1.5}>
            {purchasesInBranch.map((p) => (
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
                    label={formatDeliveryTarget(p)}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                {p.product && (
                  <Typography variant="body2" color="text.secondary">
                    Стоимость: {p.product.cost} ₸
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Тип доставки: {p.delivery_type}
                </Typography>
                {p.delivery_type === 'POSTOMAT' && p.postomat && (
                  <Typography variant="body2" color="text.secondary">
                    Постамат назначения: {p.postomat.adress}
                  </Typography>
                )}
                {p.courier_id && (
                  <Typography variant="body2" color="text.secondary">
                    Назначен курьер ID: {p.courier_id}
                  </Typography>
                )}

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: 'wrap' }}
                >
                  {p.delivery_type === 'COURIER' && (
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#6f2dbd' }}
                      onClick={() => handleAssignCourier(p.id)}
                    >
                      Передать курьеру
                    </Button>
                  )}
                  {p.delivery_type === 'POSTOMAT' && (
                    <Button
                      variant="outlined"
                      sx={{ borderColor: '#6f2dbd', color: '#6f2dbd' }}
                      onClick={() => handleSendToPostomat(p.id)}
                    >
                      Отправить в постамат
                    </Button>
                  )}
                  {p.delivery_type === 'BRANCH' && (
                    <Button
                      variant="outlined"
                      onClick={() => handleMarkAsGivenAtBranch(p.id)}
                    >
                      Выдать клиенту на кассе
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
