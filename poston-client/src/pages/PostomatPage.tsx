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
import type { Postomat, Purchase, Slot, User } from '../types'
import QRCode from 'react-qr-code'
import { useUser } from '../context/user/useUser'

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
  const { user } = useUser()
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
      <QRCode
        value={'postid:' + String(user.id)}
        size={300}
        style={{
          height: 'auto',
          maxWidth: '100%',
          width: '350px',
          padding: '10px',
        }}
      />
    </Box>
  )
}
