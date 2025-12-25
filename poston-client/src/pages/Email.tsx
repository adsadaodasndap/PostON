import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import HomeButton from '../components/HomeButton'
import { useUser } from '../context/user/useUser'
import { confirmEmail, sendEmail } from '../http/API'

const Email = () => {
  const { user, setUser } = useUser()
  const [sending, setSending] = useState(false)
  const [searchParams] = useSearchParams()

  const submit = () => {
    setSending(true)
    sendEmail()
      .catch(() => {
        // toast внутри API.ts, тут можно ничего не делать
      })
      .finally(() => setSending(false))
  }

  useEffect(() => {
    const secret = searchParams.get('secret')
    if (!secret) return

    confirmEmail(secret).then((res) => {
      // confirmEmail в API.ts обычно возвращает объект { message?: string } | undefined
      // Логика: если запрос успешный и вернулся ответ — считаем подтвержденным
      if (!res) return

      setUser((prev) => ({
        ...prev,
        active: true,
      }))
    })
  }, [searchParams, setUser])

  const isActive = Boolean(user?.active)
  const email = user?.email ?? ''

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <HomeButton />
        <Typography sx={{ mt: 1 }}>
          {isActive ? 'Почта подтверждена!' : 'Требуется подтверждение почты'}
        </Typography>
      </Paper>

      <Dialog open={!isActive}>
        <DialogTitle>Подтвердите вашу почту</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 5 }}>
            Сервис будет доступен после подтверждения почты. Проверьте входящие
            письма по адресу {email} и перейдите по ссылке в письме
            подтверждения.
          </DialogContentText>

          <DialogContentText>
            Если письма нет, проверьте папку &quot;Спам&quot; или запросите
            повторную отправку.
          </DialogContentText>

          <DialogActions>
            <LoadingButton loading={sending} onClick={submit}>
              Отправить письмо заново
            </LoadingButton>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Email
