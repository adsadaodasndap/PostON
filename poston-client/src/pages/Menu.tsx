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

import { QrCode } from '@mui/icons-material'
import AssistantIcon from '@mui/icons-material/Assistant'
import EmailIcon from '@mui/icons-material/Email'
import LanguageIcon from '@mui/icons-material/Language'
import MapIcon from '@mui/icons-material/Map'
import TelegramIcon from '@mui/icons-material/Telegram'
import { useState } from 'react'
import GoogleLoginButton from '../../../../web-course-2025/test-client-v2/src/components/GoogleButton'
import { useUser } from '../../../../web-course-2025/test-client-v2/src/context/user/useUser'
import { signIn, signUp } from '..//http/API'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const pages = [
  {
    name: 'Telegram Bot',
    id: '1-telegram',
    icon: TelegramIcon,
  },
  {
    name: 'Email',
    id: '2-email',
    icon: EmailIcon,
  },
  {
    name: 'GPT-модели',
    id: '3-gpt',
    icon: AssistantIcon,
  },
  {
    name: 'Карты + Геолокация',
    id: '4-leaflet',
    icon: MapIcon,
  },
  {
    name: 'Переводы приложения',
    id: '5-i18n',
    icon: LanguageIcon,
  },
  // {
  //   name: 'Notifications API (уведомления)',
  //   id: '6-notif',
  //   icon: NotificationsActiveIcon,
  // },
  // {
  //   name: 'Google OAuth',
  //   id: '7-notif',
  //   icon: GoogleIcon,
  // },
  {
    name: 'QR-коды',
    id: '8-qr',
    icon: QrCode,
  },
]

const Menu = () => {
  const { user, login, logout } = useUser()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [value, setValue] = useState(0)

  const submitSignUp = async () => {
    const res = await signUp(firstName, lastName, email, password)
    if (res.token) {
      login(res.user, res.token)
    }
  }

  const submitSignIn = async () => {
    const res = await signIn(email, password)

    if (res.token) {
      login(res.user, res.token)
    }
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Paper sx={{ p: 2 }} component={Stack}>
      {!user.role ? (
        <>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Войти" />
            <Tab label="Зарегистрироваться" />
          </Tabs>
          <CustomTabPanel value={value} index={0}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitSignIn()
              }}
            >
              <Stack gap={1}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  label="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" variant="contained" fullWidth>
                  Войти
                </Button>
              </Stack>
            </form>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitSignUp()
              }}
            >
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" variant="contained" fullWidth>
                  Зарегистрироваться
                </Button>
              </Stack>
            </form>
          </CustomTabPanel>
          <GoogleLoginButton />
        </>
      ) : (
        <Stack alignItems={'center'}>
          <Avatar src={user.photoURL} sx={{ height: 100, width: 100 }} />
          <Typography variant="h5">{user.email}</Typography>
          <Typography variant="h6">
            {user.firstName} {user.lastName}
          </Typography>
          <Button onClick={() => logout()}>Выйти из аккаунта</Button>
        </Stack>
      )}
      <Divider sx={{ my: 2 }} />
      {pages.map((p) => (
        <Button startIcon={<p.icon />} component={Link} to={'/' + p.id}>
          {p.name}
        </Button>
      ))}
    </Paper>
  )
}

export default Menu
