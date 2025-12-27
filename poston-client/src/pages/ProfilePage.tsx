import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

import MailOutlineIcon from '@mui/icons-material/MailOutline'
import VerifiedIcon from '@mui/icons-material/Verified'
import TelegramIcon from '@mui/icons-material/Telegram'
import LogoutIcon from '@mui/icons-material/Logout'
import SendIcon from '@mui/icons-material/Send'
import SaveIcon from '@mui/icons-material/Save'

import { toast } from 'react-toastify'

import { useUser } from '../context/user/useUser'
import { bindTg, confirmEmail, sendEmail } from '../http/API'

const roleMap: Record<string, string> = {
  ADMIN: 'Администратор',
  SELLER: 'Продавец',
  BUYER: 'Покупатель',
  COURIER: 'Курьер',
  POSTAMAT: 'Постамат',
}

export default function ProfilePage() {
  const { user, logout } = useUser()

  const [emailCode, setEmailCode] = useState('')
  const [tgId, setTgId] = useState(user.tg_id ? String(user.tg_id) : '')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingConfirm, setLoadingConfirm] = useState(false)
  const [loadingTg, setLoadingTg] = useState(false)

  const emailVerified = Boolean(user.active) // в твоём сервере active=true после confirmEmail

  const roleLabel = useMemo(() => {
    if (!user.role) return 'Роль не задана'
    return roleMap[user.role] ?? user.role
  }, [user.role])

  const onSendEmail = async () => {
    try {
      setLoadingEmail(true)
      await sendEmail()
    } catch {
      toast.error('Не удалось отправить письмо')
    } finally {
      setLoadingEmail(false)
    }
  }

  const onConfirmEmail = async () => {
    const code = emailCode.trim()
    if (!code) return

    try {
      setLoadingConfirm(true)
      await confirmEmail(code)
      // verify() у тебя дергается при старте приложения, но проще обновить страницу:
      window.location.reload()
    } catch {
      toast.error('Не удалось подтвердить почту')
    } finally {
      setLoadingConfirm(false)
    }
  }

  const onBindTelegram = async () => {
    const id = tgId.trim()
    if (!id) return

    try {
      setLoadingTg(true)
      await bindTg(id)
      window.location.reload()
    } catch {
      toast.error('Не удалось привязать Telegram')
    } finally {
      setLoadingTg(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Профиль
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={2.25}>
            {/* Основные данные */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user.name || 'Пользователь'}
              </Typography>
              <Typography color="text.secondary">{user.email}</Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={roleLabel} color="primary" variant="outlined" />

              {emailVerified ? (
                <Chip
                  icon={<VerifiedIcon />}
                  label="Email подтвержден"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<MailOutlineIcon />}
                  label="Email не подтвержден"
                  color="warning"
                  variant="outlined"
                />
              )}

              {user.tg_id ? (
                <Chip
                  icon={<TelegramIcon />}
                  label="Telegram привязан"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<TelegramIcon />}
                  label="Telegram не привязан"
                  color="default"
                  variant="outlined"
                />
              )}
            </Stack>

            <Divider />

            {/* Email подтверждение */}
            {!emailVerified && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Подтвердите email, чтобы включить все возможности аккаунта.
                </Alert>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={onSendEmail}
                    disabled={loadingEmail}
                  >
                    Отправить код
                  </Button>

                  <TextField
                    size="small"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Код из письма"
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    onClick={onConfirmEmail}
                    disabled={loadingConfirm || !emailCode.trim()}
                  >
                    Подтвердить
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Telegram */}
            {!user.tg_id && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Привязка Telegram
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    size="small"
                    value={tgId}
                    onChange={(e) => setTgId(e.target.value)}
                    placeholder="Ваш Telegram ID"
                    fullWidth
                    helperText="Узнать Telegram ID: напишите /start в боте"
                  />

                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={onBindTelegram}
                    disabled={loadingTg || !tgId.trim()}
                  >
                    Привязать
                  </Button>
                </Stack>
              </Box>
            )}

            <Divider />

            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => logout(true)}
            >
              Выйти
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
