import * as React from 'react'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import type { Purchase } from '../types'
import { getPurchases } from '../http/API'
import { useUser } from '../context/user/useUser'

import { QRCodeCanvas } from 'qrcode.react'

function isPostomatCourier(p: any) {
  return p?.delivery_type === 'COURIER' && p?.courier_mode === 'POSTOMAT'
}

function isFinishedForCourier(p: any) {
  if (isPostomatCourier(p)) {
    if (p.status === 'READY_FOR_PICKUP' || p.status === 'PICKED_UP') return true
    return Boolean(p.date_send)
  }

  return false
}

export default function CourierPage() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [purchases, setPurchases] = React.useState<Purchase[]>([])
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const r = await getPurchases()
      if (r?.purchases) setPurchases(r.purchases)
    } catch (e) {
      console.log(e)
      toast.error('Не удалось загрузить доставки')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const courierOnly = purchases.filter(
    (p: any) => p.delivery_type === 'COURIER'
  )

  const active = courierOnly.filter((p: any) => !isFinishedForCourier(p))
  const finished = courierOnly.filter((p: any) => isFinishedForCourier(p))

  const label = (p: any) => {
    if (p.delivery_type !== 'COURIER') return 'Не курьерская'
    return p.courier_mode === 'POSTOMAT'
      ? 'Курьером в постомат'
      : 'Доставка до двери'
  }

  const openPostomatFlow = (p: any) => {
    const qr = String(p?.courier_qr || '').trim()
    if (qr) navigate(`/postomat?mode=COURIER&qr=${encodeURIComponent(qr)}`)
    else navigate('/postomat?mode=COURIER')
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
          maxWidth: 980,
          width: '100%',
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Интерфейс курьера
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Текущий курьер: {user.name || user.email}{' '}
          {loading ? '(загрузка...)' : ''}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Активные задания
        </Typography>

        {active.length === 0 && (
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            Активных доставок нет.
          </Typography>
        )}

        {active.length > 0 && (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {active.map((p: any) => {
              const courierQr = String(p?.courier_qr || '').trim()

              return (
                <Paper
                  key={p.id}
                  sx={{
                    p: 1.75,
                    borderRadius: 1.5,
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                  >
                    <Typography fontWeight={700}>
                      Покупка №{p.id} {p.product ? `– ${p.product.name}` : ''}
                    </Typography>

                    <Chip
                      size="small"
                      label={label(p)}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  {p.buyer && (
                    <Typography variant="body2" color="text.secondary">
                      Получатель: {p.buyer.name}{' '}
                      {p.buyer.phone ? `(${p.buyer.phone})` : ''}
                    </Typography>
                  )}

                  {isPostomatCourier(p) && (
                    <Paper
                      sx={{
                        mt: 1,
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: '#fff',
                        border: '1px dashed #cfcfcf',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box>
                        <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                          QR для постомата (courier_qr)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Открой на ноуте. Курьер сканирует телефоном. Затем в
                          постомате нажимает “Сканировать QR”.
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            color: 'text.secondary',
                          }}
                        >
                          token: {courierQr || '—'}
                        </Typography>
                      </Box>

                      {courierQr ? (
                        <QRCodeCanvas value={courierQr} size={128} />
                      ) : (
                        <Typography color="error">
                          courier_qr отсутствует (проверь createPurchase)
                        </Typography>
                      )}
                    </Paper>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1 }}
                    flexWrap="wrap"
                  >
                    {isPostomatCourier(p) ? (
                      <Button
                        variant="contained"
                        sx={{ bgcolor: '#6f2dbd' }}
                        onClick={() => openPostomatFlow(p)}
                      >
                        Открыть постомат-флоу
                      </Button>
                    ) : (
                      <Button variant="outlined" disabled>
                        Доставка до двери (без отметки “доставлено”)
                      </Button>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        )}

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Завершённые (постомат)
        </Typography>

        {finished.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            Завершённых доставок ещё нет.
          </Typography>
        )}

        {finished.length > 0 && (
          <Stack spacing={1.5}>
            {finished.map((p: any) => (
              <Paper
                key={p.id}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <Typography fontWeight={700}>
                    Покупка №{p.id} {p.product ? `– ${p.product.name}` : ''}
                  </Typography>
                  <Chip
                    size="small"
                    label="Завершено"
                    color="success"
                    variant="outlined"
                  />
                </Stack>

                {isPostomatCourier(p) && (
                  <Button
                    variant="outlined"
                    onClick={() => openPostomatFlow(p)}
                  >
                    Открыть постомат (просмотр)
                  </Button>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
