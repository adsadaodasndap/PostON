import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useUser } from '../context/user/useUser'
import PostomatGrid, {
  type SlotView,
} from '../components/postomat/PostomatGrid'
import QrScannerDialog from '../components/QrScannerDialog'

type SlotState = { id: number; busy: boolean }
type PostomatDTO = { id: number; adress: string; lat?: number; lon?: number }

type CourierScanResp = {
  postomatId: number
  purchaseId: number
  slots: SlotState[]
  reservedSlotId: number
  reservedUntil: string | Date
  status?: string
}

type SlotsResp = {
  postomat: PostomatDTO
  slots: SlotState[]
}

type ClientScanResp = {
  purchaseId: number
  postomatId: number
  slotId: number
  status: string
}

type CourierPlaceResp = {
  message: string
  postomatId: number
  slotId: number
  status?: string
}

export default function PostomatPage() {
  const { user } = useUser()

  const [loading, setLoading] = useState(true)
  const [postomat, setPostomat] = useState<PostomatDTO | null>(null)
  const [slots, setSlots] = useState<SlotState[]>([])

  const [activeMode, setActiveMode] = useState<'COURIER' | 'BUYER' | 'MONITOR'>(
    () => {
      if (user.role === 'COURIER') return 'COURIER'
      if (user.role === 'BUYER') return 'BUYER'
      return 'MONITOR'
    }
  )

  const [qrToken, setQrToken] = useState('')
  const [qrScanOpen, setQrScanOpen] = useState(false)

  const [purchaseId, setPurchaseId] = useState<number | null>(null)
  const [reservedSlotId, setReservedSlotId] = useState<number | null>(null)
  const [doorOpened, setDoorOpened] = useState(false)

  const [clientSlotId, setClientSlotId] = useState<number | null>(null)
  const [clientDoorOpened, setClientDoorOpened] = useState(false)
  const [clientPurchaseId, setClientPurchaseId] = useState<number | null>(null)

  const [actionLoading, setActionLoading] = useState(false)
  const pollRef = useRef<number | null>(null)
  const scanLockRef = useRef(false)

  const resetCourierState = useCallback(() => {
    setPurchaseId(null)
    setReservedSlotId(null)
    setDoorOpened(false)
  }, [])

  const resetClientState = useCallback(() => {
    setClientPurchaseId(null)
    setClientSlotId(null)
    setClientDoorOpened(false)
  }, [])

  useEffect(() => {
    if (user.role === 'COURIER') setActiveMode('COURIER')
    else if (user.role === 'BUYER') setActiveMode('BUYER')
    else setActiveMode('MONITOR')
  }, [user.role])

  useEffect(() => {
    resetCourierState()
    resetClientState()
  }, [activeMode, resetCourierState, resetClientState])

  const grid: SlotView[] = useMemo(() => {
    if (activeMode === 'BUYER') {
      const total = 20
      return Array.from({ length: total }, (_, idx) => {
        const id = idx + 1
        const isTarget = clientSlotId === id
        return {
          id,
          label: id,
          state: isTarget ? 'TARGET' : 'UNKNOWN',
          disabled: !isTarget,
        }
      })
    }

    return slots.map((s, idx) => {
      const isReserved = reservedSlotId === s.id
      return {
        id: s.id,
        label: idx + 1,
        state: isReserved ? 'RESERVED' : s.busy ? 'BUSY' : 'FREE',
      }
    })
  }, [activeMode, slots, reservedSlotId, clientSlotId])

  const loadSlots = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await $host.get<SlotsResp>('postomat/slots')
      setPostomat(data.postomat)
      setSlots(data.slots)
    } catch (e) {
      console.log(e)
      if (activeMode !== 'BUYER') toast.error('Не удалось загрузить постамат')
    } finally {
      setLoading(false)
    }
  }, [activeMode])

  useEffect(() => {
    if (activeMode !== 'BUYER') loadSlots()
  }, [activeMode, loadSlots])

  useEffect(() => {
    if (activeMode === 'BUYER') return

    if (pollRef.current) window.clearInterval(pollRef.current)

    pollRef.current = window.setInterval(() => {
      if (!actionLoading) loadSlots()
    }, 5000)

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [activeMode, actionLoading, loadSlots])

  const courierScan = useCallback(
    async (tokenOverride?: string) => {
      const token = (tokenOverride ?? qrToken).trim()
      if (!token) return toast.error('Введи QR')

      try {
        setActionLoading(true)
        const { data } = await $host.post<CourierScanResp>(
          'postomat/courier/scan',
          { qr: token }
        )

        setPurchaseId(data.purchaseId)
        setReservedSlotId(data.reservedSlotId)
        setDoorOpened(false)
        setSlots(data.slots)

        toast.success(`Ячейка #${data.reservedSlotId} зарезервирована`)
      } catch (e) {
        console.log(e)
        toast.error('Скан не прошёл')
      } finally {
        setActionLoading(false)
      }
    },
    [qrToken]
  )

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
    if (!doorOpened) return toast.error('Сначала открой дверцу')

    try {
      setActionLoading(true)
      const { data } = await $host.post<CourierPlaceResp>(
        'postomat/courier/place',
        { purchaseId }
      )
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
      resetCourierState()
      toast.success('Дверца закрыта. Посылка готова к выдаче')
      await loadSlots()
    } catch (e) {
      console.log(e)
      toast.error('Не удалось закрыть дверцу')
    } finally {
      setActionLoading(false)
    }
  }

  const clientScan = useCallback(
    async (tokenOverride?: string) => {
      const token = (tokenOverride ?? qrToken).trim()
      if (!token) return toast.error('Введи QR')

      try {
        setActionLoading(true)
        const { data } = await $host.post<ClientScanResp>(
          'postomat/client/scan',
          { qr: token }
        )
        setClientPurchaseId(data.purchaseId)
        setClientSlotId(data.slotId)
        setClientDoorOpened(false)
        toast.success(`Твоя ячейка: #${data.slotId}`)
      } catch (e) {
        console.log(e)
        toast.error('Скан не прошёл')
      } finally {
        setActionLoading(false)
      }
    },
    [qrToken]
  )

  const clientOpenDoor = async () => {
    if (!clientPurchaseId) return toast.error('Сначала скан QR')

    try {
      setActionLoading(true)
      await $host.post('postomat/client/open', { purchaseId: clientPurchaseId })
      setClientDoorOpened(true)
      toast.success('Дверца открыта')
    } catch (e) {
      console.log(e)
      toast.error('Не удалось открыть дверцу')
    } finally {
      setActionLoading(false)
    }
  }

  const clientTake = async () => {
    if (!clientPurchaseId) return toast.error('Сначала скан QR')
    if (!clientDoorOpened) return toast.error('Сначала открой дверцу')

    try {
      setActionLoading(true)
      await $host.post('postomat/client/take', { purchaseId: clientPurchaseId })
      toast.success('Посылка получена')
    } catch (e) {
      console.log(e)
      toast.error('Не удалось забрать посылку')
    } finally {
      setActionLoading(false)
    }
  }

  const clientCloseDoor = async () => {
    if (!clientPurchaseId) return toast.error('Сначала скан QR')

    try {
      setActionLoading(true)
      await $host.post('postomat/client/close', {
        purchaseId: clientPurchaseId,
      })
      resetClientState()
      toast.success('Дверца закрыта')
    } catch (e) {
      console.log(e)
      toast.error('Не удалось закрыть дверцу')
    } finally {
      setActionLoading(false)
    }
  }

  const onDetectedQr = useCallback(
    async (value: string) => {
      const token = String(value).trim()
      if (!token) return

      if (scanLockRef.current) return
      scanLockRef.current = true

      setQrToken(token)
      setQrScanOpen(false)

      try {
        if (activeMode === 'COURIER') {
          await courierScan(token)
        } else if (activeMode === 'BUYER') {
          await clientScan(token)
        } else {
          toast.info('QR считан')
        }
      } finally {
        window.setTimeout(() => {
          scanLockRef.current = false
        }, 800)
      }
    },
    [activeMode, courierScan, clientScan]
  )

  const qrLabel =
    activeMode === 'COURIER'
      ? 'QR (qr_token) — скан курьера'
      : activeMode === 'BUYER'
        ? 'QR (qr_token) — скан клиента'
        : 'QR (qr_token)'

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

          <Button
            variant="outlined"
            onClick={loadSlots}
            disabled={loading || activeMode === 'BUYER'}
          >
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
              Управление
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Роль: {user.role ?? '—'}. Режим: {activeMode}.
            </Typography>

            <Stack spacing={1.5}>
              <TextField
                label={qrLabel}
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                size="small"
                fullWidth
              />

              <Button
                variant="outlined"
                onClick={() => setQrScanOpen(true)}
                disabled={actionLoading}
              >
                Сканировать камерой
              </Button>

              {activeMode === 'COURIER' && (
                <Button
                  variant="contained"
                  onClick={() => courierScan()}
                  disabled={actionLoading}
                >
                  Сканировать QR
                </Button>
              )}

              {activeMode === 'BUYER' && (
                <Button
                  variant="contained"
                  onClick={() => clientScan()}
                  disabled={actionLoading}
                >
                  Сканировать QR
                </Button>
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={
                    activeMode === 'BUYER'
                      ? clientPurchaseId
                        ? `purchaseId: ${clientPurchaseId}`
                        : 'purchaseId: —'
                      : purchaseId
                        ? `purchaseId: ${purchaseId}`
                        : 'purchaseId: —'
                  }
                  variant="outlined"
                />
                <Chip
                  label={
                    activeMode === 'BUYER'
                      ? clientSlotId
                        ? `ячейка: #${clientSlotId}`
                        : 'ячейка: —'
                      : reservedSlotId
                        ? `ячейка: #${reservedSlotId}`
                        : 'ячейка: —'
                  }
                  color={
                    activeMode === 'BUYER'
                      ? clientSlotId
                        ? 'primary'
                        : 'default'
                      : reservedSlotId
                        ? 'primary'
                        : 'default'
                  }
                  variant="outlined"
                />
              </Stack>

              {activeMode === 'COURIER' && (
                <>
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
                </>
              )}

              {activeMode === 'BUYER' && (
                <>
                  <Button
                    variant="outlined"
                    onClick={clientOpenDoor}
                    disabled={
                      actionLoading || !clientPurchaseId || clientDoorOpened
                    }
                  >
                    Открыть дверцу
                  </Button>

                  <Button
                    variant="contained"
                    onClick={clientTake}
                    disabled={
                      actionLoading || !clientPurchaseId || !clientDoorOpened
                    }
                  >
                    Забрать
                  </Button>

                  <Button
                    color="warning"
                    variant="contained"
                    onClick={clientCloseDoor}
                    disabled={actionLoading || !clientPurchaseId}
                  >
                    Закрыть дверцу
                  </Button>
                </>
              )}

              {actionLoading && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Выполняю операцию...
                  </Typography>
                </Stack>
              )}

              {activeMode === 'COURIER' && doorOpened && (
                <Typography variant="body2" color="error">
                  Дверца открыта. Чтобы завершить — нужно закрыть.
                </Typography>
              )}

              {activeMode === 'BUYER' && clientDoorOpened && (
                <Typography variant="body2" color="error">
                  Дверца открыта. Чтобы завершить — нужно закрыть.
                </Typography>
              )}

              {activeMode === 'BUYER' && (
                <Typography variant="body2" color="text.secondary">
                  Клиент видит только свою ячейку после сканирования QR.
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

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
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
              <Chip label="Ваша" sx={{ bgcolor: '#1976d2', color: 'white' }} />
              <Chip
                label="Недоступно"
                sx={{ bgcolor: '#9e9e9e', color: 'white' }}
              />
            </Stack>

            {loading && activeMode !== 'BUYER' ? (
              <Stack alignItems="center" sx={{ py: 6 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <PostomatGrid slots={grid} />
            )}
          </Paper>
        </Stack>
      </Paper>

      <QrScannerDialog
        open={qrScanOpen}
        onClose={() => setQrScanOpen(false)}
        onDetected={onDetectedQr}
      />
    </Box>
  )
}
