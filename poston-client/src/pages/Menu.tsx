import {
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import QrCodeIcon from '@mui/icons-material/QrCode'
import AssistantIcon from '@mui/icons-material/Assistant'
import EmailIcon from '@mui/icons-material/Email'
import LanguageIcon from '@mui/icons-material/Language'
import MapIcon from '@mui/icons-material/Map'
import TelegramIcon from '@mui/icons-material/Telegram'

import { useUser } from '../context/user/useUser'
import { signIn, signUp } from '../http/API'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null
  return <Box sx={{ p: 3 }}>{children}</Box>
}

const pages = [
  { name: 'Telegram Bot', id: '1-telegram', icon: TelegramIcon },
  { name: 'Email', id: '2-email', icon: EmailIcon },
  { name: 'GPT-модели', id: '3-gpt', icon: AssistantIcon },
  { name: 'Карты + Геолокация', id: '4-leaflet', icon: MapIcon },
  { name: 'Переводы', id: '5-i18n', icon: LanguageIcon },
  { name: 'QR-коды', id: '8-qr', icon: QrCodeIcon },
]

const Menu = () => {
  const { user, login, logout } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [tab, setTab] = useState(0)

  const submitSignIn = async () => {
    const res = await signIn(email, password)
    if (res?.token) login(res.user, res.token)
  }

  const submitSignUp = async () => {
    const res = await signUp(firstName, lastName, email, password)
    if (res?.token) login(res.user, res.token)
  }

  return (
    <Paper sx={{ p: 2 }} component={Stack} spacing={2}>
      {!user?.role ? (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Войти" />
            <Tab label="Регистрация" />
          </Tabs>

          <CustomTabPanel value={tab} index={0}>
            <Stack gap={1}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button variant="contained" onClick={submitSignIn}>
                Войти
              </Button>
            </Stack>
          </CustomTabPanel>

          <CustomTabPanel value={tab} index={1}>
            <Stack gap={1}>
              <TextField
                label="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                label="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button variant="contained" onClick={submitSignUp}>
                Зарегистрироваться
              </Button>
            </Stack>
          </CustomTabPanel>
        </>
      ) : (
        <Stack alignItems="center" spacing={1}>
          <Avatar sx={{ width: 96, height: 96 }} />
          <Typography>{user.email}</Typography>
          <Typography variant="caption">Роль: {user.role}</Typography>
          <Button onClick={() => logout()}>Выйти</Button>
        </Stack>
      )}

      <Divider />

      {pages.map((p) => (
        <Button
          key={p.id}
          startIcon={<p.icon />}
          component={Link}
          to={`/${p.id}`}
        >
          {p.name}
        </Button>
      ))}
    </Paper>
  )
}

export default Menu
