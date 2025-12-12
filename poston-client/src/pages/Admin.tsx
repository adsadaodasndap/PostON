import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Select,
  MenuItem,
} from '@mui/material'
import { toast } from 'react-toastify'
import {
  createAdminUser,
  getUsers,
  getProducts,
  createProduct,
  deleteProduct,
} from '../http/API'

type RoleUI = 'COURIER' | 'POSTAMAT' | 'SELLER' | 'BUYER' | 'ADMIN'

type UserRow = {
  id: number
  name?: string
  first_name?: string
  last_name?: string
  email: string
  role: RoleUI
}

type ProductRow = {
  id: number
  name: string
  cost: number
  length: number
  width: number
  height: number
  weight: number
}

export default function AdminPage() {
  const [tab, setTab] = useState(0)

  // ---------- USERS ----------
  const [users, setUsers] = useState<UserRow[]>([])
  const [uRole, setURole] = useState<RoleUI>('COURIER')
  const [uFirst, setUFirst] = useState('')
  const [uLast, setULast] = useState('')
  const [uEmail, setUEmail] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersCreating, setUsersCreating] = useState(false)

  const fullName = useMemo(() => {
    const a = uFirst.trim()
    const b = uLast.trim()
    return `${a} ${b}`.trim()
  }, [uFirst, uLast])

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await getUsers()
      const list = Array.isArray(res) ? res : res?.users
      if (Array.isArray(list)) setUsers(list)
    } finally {
      setUsersLoading(false)
    }
  }

  const submitCreateUser = async () => {
    if (!uFirst.trim()) return toast.error('Введите имя')
    if (!uLast.trim()) return toast.error('Введите фамилию')
    if (!uEmail.trim()) return toast.error('Введите почту')

    setUsersCreating(true)
    try {
      const res = await createAdminUser({
        first_name: uFirst.trim(),
        last_name: uLast.trim(),
        email: uEmail.trim(),
        role: uRole,
      })

      if (!res) return

      toast.success('Пользователь создан')
      setUFirst('')
      setULast('')
      setUEmail('')
      setURole('COURIER')

      await loadUsers()
    } finally {
      setUsersCreating(false)
    }
  }

  const [products, setProducts] = useState<ProductRow[]>([])
  const [pName, setPName] = useState('')
  const [pCost, setPCost] = useState('')
  const [pLen, setPLen] = useState('')
  const [pWid, setPWid] = useState('')
  const [pHei, setPHei] = useState('')
  const [pWei, setPWei] = useState('')
  const [prodLoading, setProdLoading] = useState(false)
  const [prodCreating, setProdCreating] = useState(false)

  const loadProducts = async () => {
    setProdLoading(true)
    try {
      const res = await getProducts()
      const list = Array.isArray(res) ? res : res?.products
      if (Array.isArray(list)) setProducts(list)
    } finally {
      setProdLoading(false)
    }
  }

  const submitCreateProduct = async () => {
    if (!pName.trim()) return toast.error('Введите название товара')

    const cost = Number(pCost)
    const len = Number(pLen)
    const wid = Number(pWid)
    const hei = Number(pHei)
    const wei = Number(pWei)

    if (!Number.isFinite(cost) || cost <= 0) return toast.error('Цена > 0')
    if (!Number.isFinite(len) || len <= 0) return toast.error('Длина > 0')
    if (!Number.isFinite(wid) || wid <= 0) return toast.error('Ширина > 0')
    if (!Number.isFinite(hei) || hei <= 0) return toast.error('Высота > 0')
    if (!Number.isFinite(wei) || wei <= 0) return toast.error('Вес > 0')

    setProdCreating(true)
    try {
      const res = await createProduct(pName.trim(), cost, len, wid, hei, wei)
      if (!res) return
      toast.success('Товар создан')
      setPName('')
      setPCost('')
      setPLen('')
      setPWid('')
      setPHei('')
      setPWei('')
      await loadProducts()
    } finally {
      setProdCreating(false)
    }
  }

  const submitDeleteProduct = async (id: number) => {
    const res = await deleteProduct(id)
    if (!res) return
    await loadProducts()
  }

  useEffect(() => {
    loadUsers()
    loadProducts()
  }, [])

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Панель администратора
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Пользователи" />
        <Tab label="Товары" />
      </Tabs>

      {tab === 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Создать пользователя
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Select
              value={uRole}
              onChange={(e) => setURole(e.target.value as RoleUI)}
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="COURIER">Курьер</MenuItem>
              <MenuItem value="POSTAMAT">Постамат</MenuItem>
              <MenuItem value="SELLER">Сотрудник отделения</MenuItem>
              <MenuItem value="BUYER">Покупатель</MenuItem>
              <MenuItem value="ADMIN">Администратор</MenuItem>
            </Select>

            <TextField
              label="Имя"
              size="small"
              value={uFirst}
              onChange={(e) => setUFirst(e.target.value)}
            />
            <TextField
              label="Фамилия"
              size="small"
              value={uLast}
              onChange={(e) => setULast(e.target.value)}
            />
            <TextField
              label="Почта"
              size="small"
              value={uEmail}
              onChange={(e) => setUEmail(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={submitCreateUser}
              disabled={usersCreating}
            >
              {usersCreating ? 'Создание...' : 'Добавить'}
            </Button>
          </Stack>

          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Будет создан: {fullName || '—'} ({uRole})
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Список пользователей {usersLoading ? '(загрузка...)' : ''}
          </Typography>

          <Box sx={{ mt: 1 }}>
            {users.map((u) => (
              <Box
                key={u.id}
                sx={{
                  p: 1.5,
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography>
                  #{u.id} —{' '}
                  {u.name ??
                    (`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() ||
                      'Без имени')}{' '}
                  — {u.email} — {u.role}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {tab === 1 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Создать товар
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <TextField
              label="Название"
              size="small"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <TextField
              label="Цена (₸)"
              size="small"
              value={pCost}
              onChange={(e) => setPCost(e.target.value)}
            />
            <TextField
              label="Длина (мм)"
              size="small"
              value={pLen}
              onChange={(e) => setPLen(e.target.value)}
            />
            <TextField
              label="Ширина (мм)"
              size="small"
              value={pWid}
              onChange={(e) => setPWid(e.target.value)}
            />
            <TextField
              label="Высота (мм)"
              size="small"
              value={pHei}
              onChange={(e) => setPHei(e.target.value)}
            />
            <TextField
              label="Вес (г)"
              size="small"
              value={pWei}
              onChange={(e) => setPWei(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={submitCreateProduct}
              disabled={prodCreating}
            >
              {prodCreating ? 'Создание...' : 'Добавить'}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Товары {prodLoading ? '(загрузка...)' : ''}
          </Typography>

          <Box sx={{ mt: 1 }}>
            {products.map((p) => (
              <Box
                key={p.id}
                sx={{
                  p: 1.5,
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography>
                  #{p.id} — {p.name} — {p.cost}₸ — {p.length}×{p.width}×
                  {p.height} мм — {p.weight} г
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => submitDeleteProduct(p.id)}
                >
                  Удалить
                </Button>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  )
}
