import * as React from 'react'
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material'
import { Postomat, Purchase, Slot, User } from './types'

type PostomatScreenState = {
  postomat: Postomat
  slots: Slot[]
  purchases: Purchase[]
}

const initialPostomatState: PostomatScreenState = {
  postomat: {
    id: 1,
    adress: 'Постамат ТЦ «Mega»',
    lat: 49.97,
    lon: 82.61,
  },
  slots: [
    { id: 1, postomat_id: 1, width: 30, height: 20, length: 40 },
    { id: 2, postomat_id: 1, width: 30, height: 20, length: 40 },
    { id: 3, postomat_id: 1, width: 30, height: 20, length: 40 },
  ],
  purchases: [
    {
      id: 1,
      user_id: 1,
      product_id: 1,
      delivery_type: 'POSTOMAT',
      postomat_id: 1,
      postomat_slot: 1,
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
      delivery_type: 'POSTOMAT',
      postomat_id: 1,
      postomat_slot: 2,
      product: {
        id: 2,
        name: 'Наушники',
        cost: 25000,
        length: 15,
        width: 15,
        height: 10,
        weight: 0.3,
      },
      buyer: {
        id: 2,
        name: 'Покупатель 2',
        role: 'BUYER',
        phone: '+77030000002',
        email: 'client2@example.com',
      },
    },
  ],
}

function findUserByCode(code: string, purchases: Purchase[]): User | null {
  const byId = Number(code)
  if (!Number.isNaN(byId)) {
    const purchase = purchases.find((p) => p.user_id === byId)
    if (purchase && purchase.buyer) return purchase.buyer
  }
  const byEmail = purchases.find((p) => p.buyer && p.buyer.email === code)
  if (byEmail && byEmail.buyer) return byEmail.buyer
  return null
}

export default function PostomatPage() {
  const [state, setState] =
    React.useState<PostomatScreenState>(initialPostomatState)
  const [userCode, setUserCode] = React.useState('')
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)

  const handleSearchUser = () => {
    const user = findUserByCode(userCode.trim(), state.purchases)
    setCurrentUser(user)
  }

  const handleOpenCell = (purchaseId: number) => {
    setState((prev) => ({
      ...prev,
      purchases: prev.purchases.filter((p) => p.id !== purchaseId),
    }))
  }

  const parcelsForCurrentUser: Purchase[] = currentUser
    ? state.purchases.filter(
        (p) =>
          p.user_id === currentUser.id && p.postomat_id === state.postomat.id
      )
    : []

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
          maxWidth: 700,
          width: '100%',
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Интерфейс постамата
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Адрес: {state.postomat.adress}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} alignItems="center">
          <TextField
            label="ID пользователя или email"
            variant="outlined"
            size="small"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            sx={{ bgcolor: '#6f2dbd', whiteSpace: 'nowrap' }}
            onClick={handleSearchUser}
          >
            Найти посылки
          </Button>
        </Stack>

        {!currentUser && (
          <Typography sx={{ color: 'text.secondary' }}>
            Введите код пользователя или email, чтобы найти посылки.
          </Typography>
        )}

        {currentUser && parcelsForCurrentUser.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            Для пользователя {currentUser.name} нет посылок в этом постамате.
          </Typography>
        )}

        {currentUser && parcelsForCurrentUser.length > 0 && (
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Пользователь: {currentUser.name}
            </Typography>
            {parcelsForCurrentUser.map((p) => (
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
                    label="Готово к выдаче"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Ячейка:{' '}
                  {p.postomat_slot ? `№${p.postomat_slot}` : 'не указана'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#6f2dbd' }}
                    onClick={() => handleOpenCell(p.id)}
                  >
                    Открыть ячейку и выдать
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
