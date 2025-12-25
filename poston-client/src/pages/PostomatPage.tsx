import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { toast } from 'react-toastify'
import { $host } from '../http/API'

type SlotState = { id: number; busy: boolean }
type PostomatDTO = { id: number; adress: string; lat?: number; lon?: number }

type CourierScanResp = {
  postomatId: number
  purchaseId: number
  slots: SlotState[]
  reservedSlotId: number
  reservedUntil: string | Date
}

type SlotsResp = {
  postomat: PostomatDTO
  slots: SlotState[]
}

export default function PostomatPage() {
  const [loading, setLoading] = useState(true)
  const [postomat, setPostomat] = useState<PostomatDTO | null>(null)
  const [slots, setSlots] = useState<SlotState[]>([])

  const [qr, setQr] = useState('')
  const [purchaseId, setPurchaseId] = useState<number | null>(null)
  const [reservedSlotId, setReservedSlotId] = useState<number | null>(null)
  const [doorOpened, setDoorOpened] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const grid = useMemo(() => {
    return slots
  }, [slots])

  const loadSlots = async () => {
    try {
      setLoading(true)
      const { data } = await $host.get<SlotsResp>('postomat/slots')
      setPostomat(data.postomat)
      setSlots(data.slots)
    } catch (e) {
      console.log(e)
      toast.error('Не удалось загрузить постамат')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [])

  const courierScan = async () => {
    if (!qr.trim()) {
      toast.error('Введи QR')
      return
    }
    try {
      setActionLoading(true)
      const { data } = await $host.post<CourierScanResp>(
        'postomat/courier/scan',
        {
          qr: qr.trim(),
        }
      )

      setPurchaseId(data.purchaseId)
      setReservedSlotId(data.reservedSlotId)
      setDoorOpened(false)
      setSlots(data.slots)

      toast.success(`Ячейка #${data.reservedSlotId} зарезервирована`)
    } catch (e: any) {
      console.log(e)
      toast.error('Скан не прошёл')
    } finally {
      setActionLoading(false)
    }
  }

  const courierOpenDoor = async () => {
    if (!purchaseId) return toast.error('Сначала скан QR')
    try {
      setActionLoading(true)
      await $host.post('postomat/courier/open', { purchaseId })
      setDoorOpened(true)
      toast.success('Дверца открыта')
    } catch (e) {
      console.log(e)
      toast.error('Не удалось открыть дверцу')
    } finally {
      setActionLoading(false)
    }
  }

  const courierPlace = async () => {
    if (!purchaseId) return toast.error('Сначала скан QR')
    try {
      setActionLoading(true)
      const { data } = await $host.post('postomat/courier/place', {
        purchaseId,
      })
      toast.success(`Положено в ячейку #${data.slotId}`)
      await loadSlots()
    } catch (e) {
      console.log(e)
      toast.error('Не удалось положить посылку')
    } finally {
      setActionLoading(false)
    }
  }

  const courierCloseDoor = async () => {
    if (!purchaseId) return toast.error('Сначала скан QR')
    try {
      setActionLoading(true)
      await $host.post('postomat/courier/close', { purchaseId })
      setDoorOpened(false)
      setReservedSlotId(null)
      setPurchaseId(null)
      toast.success('Дверца закрыта')
      await loadSlots()
    } catch (e) {
      console.log(e)
      toast.error('Не удалось закрыть дверцу')
    } finally {
      setActionLoading(false)
    }
  }

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
          width: '100%',
          maxWidth: 1100,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Постамат
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {postomat
                ? `#${postomat.id} — ${postomat.adress}`
                : 'Загрузка...'}
            </Typography>
          </Box>

          <Button variant="outlined" onClick={loadSlots} disabled={loading}>
            Обновить
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mt: 3 }}
        >
          <Paper
            sx={{
              flex: '0 0 380px',
              p: 2,
              borderRadius: 2,
              border: '1px solid #e5e5e5',
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Сценарий курьера (демо)
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              1. Курьер вводит QR → 2. ему резервируется свободная ячейка → 3.
              открыть → положить → закрыть.
            </Typography>

            <Stack spacing={1.5}>
              <TextField
                label="QR (courier_qr)"
                value={qr}
                onChange={(e) => setQr(e.target.value)}
                size="small"
                fullWidth
              />

              <Button
                variant="contained"
                onClick={courierScan}
                disabled={actionLoading}
              >
                Сканировать QR
              </Button>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={
                    purchaseId ? `purchaseId: ${purchaseId}` : 'purchaseId: —'
                  }
                  variant="outlined"
                />
                <Chip
                  label={
                    reservedSlotId ? `ячейка: #${reservedSlotId}` : 'ячейка: —'
                  }
                  color={reservedSlotId ? 'primary' : 'default'}
                  variant="outlined"
                />
              </Stack>

              <Button
                variant="outlined"
                onClick={courierOpenDoor}
                disabled={actionLoading || !purchaseId || doorOpened}
              >
                Открыть дверцу
              </Button>

              <Button
                variant="contained"
                onClick={courierPlace}
                disabled={actionLoading || !purchaseId || !doorOpened}
              >
                Положить
              </Button>

              <Button
                color="warning"
                variant="contained"
                onClick={courierCloseDoor}
                disabled={actionLoading || !purchaseId}
              >
                Закрыть дверцу
              </Button>

              {actionLoading && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Выполняю операцию...
                  </Typography>
                </Stack>
              )}

              {doorOpened && (
                <Typography variant="body2" color="error">
                  Дверца открыта. Чтобы уйти — нужно закрыть.
                </Typography>
              )}
            </Stack>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 2,
              border: '1px solid #e5e5e5',
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Ячейки (1–20)
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label="Свободно"
                sx={{ bgcolor: '#2e7d32', color: 'white' }}
              />
              <Chip
                label="Занято"
                sx={{ bgcolor: '#d32f2f', color: 'white' }}
              />
              <Chip
                label="Резерв"
                sx={{ bgcolor: '#ed6c02', color: 'white' }}
              />
            </Stack>

            {loading ? (
              <Stack alignItems="center" sx={{ py: 6 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(4, 1fr)',
                    sm: 'repeat(5, 1fr)',
                  },
                  gap: 1.5,
                }}
              >
                {grid.map((s, i) => {
                  const isReserved = reservedSlotId === s.id
                  const bg = isReserved
                    ? '#ed6c02'
                    : s.busy
                      ? '#d32f2f'
                      : '#2e7d32'

                  return (
                    <Box
                      key={s.id}
                      sx={{
                        height: 78,
                        borderRadius: 1.5,
                        bgcolor: bg,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        position: 'relative',
                        userSelect: 'none',
                      }}
                      title={
                        isReserved
                          ? 'Зарезервировано под текущую операцию'
                          : s.busy
                            ? 'Занято'
                            : 'Свободно'
                      }
                    >
                      {i + 1}
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 6,
                          opacity: 0.9,
                          fontWeight: 600,
                        }}
                      >
                        {isReserved ? 'RESERVE' : s.busy ? 'BUSY' : 'FREE'}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Paper>
        </Stack>
      </Paper>
    </Box>
  )
}
