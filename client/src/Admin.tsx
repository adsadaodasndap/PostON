import * as React from 'react'
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  Typography,
} from '@mui/material'
import { toast } from 'react-toastify'

type Account = {
  id: number
  role: string
  name: string
}

export default function AdminPage() {
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [role, setRole] = React.useState('worker')
  const [name, setName] = React.useState('')

  const addAccount = () => {
    if (!name.trim()) {
      toast.error('Введите имя!')
      return
    }
    const newAcc = { id: Date.now(), role, name }
    setAccounts((a) => [...a, newAcc])
    setName('')
    toast.success('Аккаунт создан!')
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Панель администратора
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          size="small"
        >
          <MenuItem value="worker">Рабочий</MenuItem>
          <MenuItem value="courier">Курьер</MenuItem>
          <MenuItem value="locker">Постамат</MenuItem>
        </Select>
        <TextField
          label="Имя"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button variant="contained" onClick={addAccount}>
          Добавить
        </Button>
      </Stack>

      <Box sx={{ mt: 3 }}>
        {accounts.map((a) => (
          <Box
            key={a.id}
            sx={{ p: 1.5, border: '1px solid #ccc', borderRadius: 1, mb: 1 }}
          >
            <Typography>
              {a.name} — {a.role}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
