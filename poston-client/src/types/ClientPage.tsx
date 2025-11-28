import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

type DeliveryType = 'POSTAMAT' | 'BRANCH'

type ParcelStatus = 'IN_BRANCH' | 'IN_POSTAMAT' | 'DELIVERED'

type Parcel = {
  id: number
  trackNumber: string
  title: string
  from: string
  to: string
  deliveryType: DeliveryType
  status: ParcelStatus
  postamatName?: string
  cellNumber?: string
  canRate: boolean
}

type RatingState = {
  courierRating: number | null
  postamatRating: number | null
  productRating: number | null
  comment: string
}

const initialParcels: Parcel[] = [
  {
    id: 1,
    trackNumber: 'PO-0001',
    title: 'Кроссовки Nike',
    from: 'Алматы, склад №1',
    to: 'Оскемен, отделение №3',
    deliveryType: 'POSTAMAT',
    status: 'IN_POSTAMAT',
    postamatName: 'Постамат ТЦ «Mega»',
    cellNumber: 'A12',
    canRate: false,
  },
  {
    id: 2,
    trackNumber: 'PO-0002',
    title: 'Наушники',
    from: 'Алматы, склад №2',
    to: 'Оскемен, касса №5',
    deliveryType: 'BRANCH',
    status: 'IN_BRANCH',
    canRate: false,
  },
  {
    id: 3,
    trackNumber: 'PO-0003',
    title: 'Футболка',
    from: 'Астана',
    to: 'Оскемен, постамат возле ВКТУ',
    deliveryType: 'POSTAMAT',
    status: 'DELIVERED',
    postamatName: 'Постамат «ВКТУ»',
    cellNumber: 'C03',
    canRate: true,
  },
]

export default function ClientPage() {
  const [parcels, setParcels] = React.useState<Parcel[]>(initialParcels)
  const [ratingDialogOpen, setRatingDialogOpen] = React.useState(false)
  const [selectedParcel, setSelectedParcel] = React.useState<Parcel | null>(
    null
  )
  const [rating, setRating] = React.useState<RatingState>({
    courierRating: null,
    postamatRating: null,
    productRating: null,
    comment: '',
  })

  const openRatingDialog = (parcel: Parcel) => {
    setSelectedParcel(parcel)
    setRating({
      courierRating: null,
      postamatRating: null,
      productRating: null,
      comment: '',
    })
    setRatingDialogOpen(true)
  }

  const closeRatingDialog = () => {
    setRatingDialogOpen(false)
    setSelectedParcel(null)
  }

  const markAsPickedUp = (parcelId: number) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              status: 'DELIVERED',
              canRate: true,
            }
          : p
      )
    )

    const parcel = parcels.find((p) => p.id === parcelId)
    if (parcel) {
      openRatingDialog({
        ...parcel,
        status: 'DELIVERED',
        canRate: true,
      })
    }
  }

  const submitRating = () => {
    if (!selectedParcel) return

    console.log('Сохраняем оценку для посылки', selectedParcel.id, rating)

    setParcels((prev) =>
      prev.map((p) =>
        p.id === selectedParcel.id
          ? {
              ...p,
              canRate: false,
            }
          : p
      )
    )

    closeRatingDialog()
  }

  const activeParcels = parcels.filter(
    (p) => p.status === 'IN_BRANCH' || p.status === 'IN_POSTAMAT'
  )
  const deliveredParcels = parcels.filter((p) => p.status === 'DELIVERED')

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
          maxWidth: 900,
          width: '100%',
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Интерфейс пользователя
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Здесь пользователь видит свои посылки, может забрать их на кассе или в
          постамате, а после получения — оценить курьера, постамат и товар.
        </Typography>

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Активные посылки
        </Typography>
        {activeParcels.length === 0 ? (
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            У вас нет активных посылок.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {activeParcels.map((p) => (
              <Paper
                key={p.id}
                sx={{
                  p: 1.5,
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
                >
                  <Typography fontWeight={600}>{p.title}</Typography>
                  <Chip
                    size="small"
                    label={
                      p.deliveryType === 'POSTAMAT'
                        ? 'Получение в постамате'
                        : 'Получение на кассе'
                    }
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Трек-номер: <b>{p.trackNumber}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Откуда: {p.from}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Куда: {p.to}
                </Typography>

                {p.deliveryType === 'POSTAMAT' && (
                  <Typography variant="body2" color="text.secondary">
                    Постамат: {p.postamatName ?? '—'}, ячейка{' '}
                    {p.cellNumber ?? '—'}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#6f2dbd' }}
                    onClick={() => markAsPickedUp(p.id)}
                  >
                    Я забрал посылку
                  </Button>

                  {p.deliveryType === 'POSTAMAT' && (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        alert(
                          `Здесь в будущем можно показать QR-код пользователя или код для сканирования.\nПока просто подсказка.\n\nПостамат: ${p.postamatName}\nЯчейка: ${p.cellNumber}`
                        )
                      }
                    >
                      Показать код для постамата
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Полученные посылки
        </Typography>
        {deliveredParcels.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>
            История полученных посылок появится здесь.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {deliveredParcels.map((p) => (
              <Paper
                key={p.id}
                sx={{
                  p: 1.5,
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
                >
                  <Typography fontWeight={600}>{p.title}</Typography>
                  <Chip
                    size="small"
                    label="Уже получена"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Трек-номер: <b>{p.trackNumber}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Способ получения:{' '}
                  {p.deliveryType === 'POSTAMAT'
                    ? 'постамат'
                    : 'на кассе отделения'}
                </Typography>

                {p.canRate ? (
                  <Button
                    variant="outlined"
                    sx={{ mt: 1, borderColor: '#6f2dbd', color: '#6f2dbd' }}
                    onClick={() => openRatingDialog(p)}
                  >
                    Оценить курьера, постамат и товар
                  </Button>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: 'text.secondary' }}
                  >
                    Оценка для этой посылки уже сохранена.
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        )}

        <Dialog open={ratingDialogOpen} onClose={closeRatingDialog} fullWidth>
          <DialogTitle>Оценка доставки</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {selectedParcel && (
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                Посылка: <b>{selectedParcel.title}</b> (
                {selectedParcel.trackNumber})
              </Typography>
            )}

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Оценка курьера
                </Typography>
                <Rating
                  value={rating.courierRating}
                  onChange={(_, value) =>
                    setRating((prev) => ({ ...prev, courierRating: value }))
                  }
                />
              </Box>

              {selectedParcel?.deliveryType === 'POSTAMAT' && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Оценка постамата
                  </Typography>
                  <Rating
                    value={rating.postamatRating}
                    onChange={(_, value) =>
                      setRating((prev) => ({ ...prev, postamatRating: value }))
                    }
                  />
                </Box>
              )}

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Оценка товара
                </Typography>
                <Rating
                  value={rating.productRating}
                  onChange={(_, value) =>
                    setRating((prev) => ({ ...prev, productRating: value }))
                  }
                />
              </Box>

              <TextField
                label="Комментарий к товару / доставке"
                multiline
                minRows={3}
                value={rating.comment}
                onChange={(e) =>
                  setRating((prev) => ({ ...prev, comment: e.target.value }))
                }
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRatingDialog}>Отмена</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: '#6f2dbd' }}
              onClick={submitRating}
            >
              Сохранить оценку
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  )
}
