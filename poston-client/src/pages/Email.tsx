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
import { useUser } from '../../../../web-course-2025/test-client-v2/src/context/user/useUser'
import { useEffect, useState } from 'react'
import { confirmEmail, sendEmail } from '../http/API'
import { useSearchParams } from 'react-router-dom'
import HomeButton from '../components/HomeButton'

const Email = () => {
  const { user, setUser } = useUser()
  const [sending, setSending] = useState(false)
  const [searchParams] = useSearchParams()

  const submit = () => {
    setSending(true)
    sendEmail()
      .catch(() => {
        // обработка ошибки при необходимости
      })
      .finally(() => setSending(false))
  }

  useEffect(() => {
    const secret = searchParams.get('secret')
    if (!secret) return

    confirmEmail(secret).then((isConfirmed: boolean) => {
      if (!isConfirmed) return
      setUser((prev) => ({ ...prev, active: true }))
    })
  }, [searchParams, setUser])

  return (
    <>
      <Paper>
        <HomeButton />
        <Typography>Почта подтверждена!</Typography>
      </Paper>
      <Dialog open={!user.active}>
        <DialogTitle>Подтвердите вашу почту</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 5 }}>
            Сервис PEXpert будет доступен Вам после подтверждения почты.
            Пожалуйста, проверьте входящие письма по адресу {user.email} и
            перейдите по ссылке в нашем письме подтверждения.
          </DialogContentText>
          <DialogContentText>
            Если письма нет в Вашем ящике, проверьте папку &quot;Спам&quot; или
            запросите повторную отправку письма.
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
