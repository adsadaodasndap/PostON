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
import type { Purchase } from '../types'
import { Scanner } from '@yudiel/react-qr-scanner'
import { toast } from 'react-toastify'
import { scanPostamat } from '../http/API'
type RatingState = {
  pointsProduct: number | null
  pointsDelivery: number | null
  content: string
}

const highlightCodeOnCanvas = (detectedCodes: any, ctx: any) => {
  detectedCodes.forEach((detectedCode: any) => {
    const { boundingBox, cornerPoints } = detectedCode

    // Draw bounding box
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 4
    ctx.strokeRect(
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    )

    // Draw corner points
    ctx.fillStyle = '#FF0000'
    cornerPoints.forEach((point: any) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
      ctx.fill()
    })
  })
}

const mockClientPurchases: Purchase[] = [
  {
    id: 1,
    user_id: 1,
    product_id: 1,
    date_buy: '2025-10-01T12:00:00Z',
    date_send: '2025-10-02T10:00:00Z',
    delivery_type: 'POSTOMAT',
    postomat_id: 1,
    postomat_slot: 1,
    product: {
      id: 1,
      name: 'Кроссовки',
      cost: 45000,
      length: 30,
      width: 20,
      height: 12,
      weight: 0.8,
    },
    postomat: { id: 1, adress: 'Постамат ТЦ «Mega»', lat: 49.97, lon: 82.61 },
    slot: { id: 1, postomat_id: 1, width: 35, height: 20, length: 40 },
    review: undefined,
  },
  {
    id: 2,
    user_id: 1,
    product_id: 2,
    date_buy: '2025-10-05T14:00:00Z',
    date_send: '2025-10-06T09:00:00Z',
    date_receive: '2025-10-07T18:30:00Z',
    delivery_type: 'BRANCH',
    branch_id: 1,
    product: {
      id: 2,
      name: 'Наушники',
      cost: 25000,
      length: 15,
      width: 15,
      height: 10,
      weight: 0.3,
    },
    branch: { id: 1, adress: 'Отделение №3, Оскемен', post_rating: 5 },
    review: {
      id: 1,
      purchase_id: 2,
      points_product: 5,
      points_delivery: 4,
      content: 'Все отлично, только немного задержали выдачу',
    },
  },
  {
    id: 3,
    user_id: 1,
    product_id: 3,
    date_buy: '2025-10-10T09:00:00Z',
    date_send: '2025-10-10T16:00:00Z',
    date_receive: '2025-10-11T13:15:00Z',
    delivery_type: 'POSTOMAT',
    postomat_id: 2,
    postomat_slot: 3,
    product: {
      id: 3,
      name: 'Футболка',
      cost: 8000,
      length: 25,
      width: 20,
      height: 3,
      weight: 0.2,
    },
    postomat: { id: 2, adress: 'Постамат возле ВКТУ', lat: 49.96, lon: 82.61 },
    slot: { id: 3, postomat_id: 2, width: 35, height: 20, length: 40 },
    review: undefined,
  },
]

function formatDeliveryType(type: Purchase['delivery_type']) {
  if (type === 'POSTOMAT') return 'Получение в постамате'
  if (type === 'BRANCH') return 'Получение в отделении на кассе'
  return 'Доставка курьером'
}

function isDelivered(p: Purchase) {
  return Boolean(p.date_receive)
}

export default function ClientPage() {
  // const [qrtext, setQRtext] = React.useState('')
  const [isPaused, setIsPaused] = React.useState(false)
  const [hasPermission, setHasPermission] = React.useState(false)

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPermission(true)
    } catch (e) {
      console.error('Нет доступа к камере', e)
      setHasPermission(false)
      toast.info('Разрешение на камеру отклонено.')
    }
  }
  React.useEffect(() => {
    requestCameraPermission()
  }, [])

  const [purchases, setPurchases] =
    React.useState<Purchase[]>(mockClientPurchases)
  const [ratingDialogOpen, setRatingDialogOpen] = React.useState(false)
  const [selectedPurchaseId, setSelectedPurchaseId] = React.useState<
    number | null
  >(null)
  const [rating, setRating] = React.useState<RatingState>({
    pointsProduct: null,
    pointsDelivery: null,
    content: '',
  })

  const activePurchases = purchases.filter((p) => !isDelivered(p))
  const deliveredPurchases = purchases.filter((p) => isDelivered(p))

  const selectedPurchase = selectedPurchaseId
    ? (purchases.find((p) => p.id === selectedPurchaseId) ?? null)
    : null

  const handleMarkAsReceived = (purchaseId: number) => {
    const now = new Date().toISOString()
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              date_receive: now,
            }
          : p
      )
    )
    setSelectedPurchaseId(purchaseId)
    setRating({
      pointsProduct: null,
      pointsDelivery: null,
      content: '',
    })
    setRatingDialogOpen(true)
  }

  const handleOpenRating = (purchaseId: number) => {
    const purchase = purchases.find((p) => p.id === purchaseId)
    setSelectedPurchaseId(purchaseId)
    if (purchase && purchase.review) {
      setRating({
        pointsProduct: purchase.review.points_product,
        pointsDelivery: purchase.review.points_delivery,
        content: purchase.review.content,
      })
    } else {
      setRating({
        pointsProduct: null,
        pointsDelivery: null,
        content: '',
      })
    }
    setRatingDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setRatingDialogOpen(false)
    setSelectedPurchaseId(null)
  }

  const handleSubmitRating = () => {
    if (!selectedPurchase) return
    if (!rating.pointsProduct || !rating.pointsDelivery) return

    const newReviewId = Date.now()
    const newReview = {
      id: newReviewId,
      purchase_id: selectedPurchase.id,
      points_product: rating.pointsProduct,
      points_delivery: rating.pointsDelivery,
      content: rating.content,
    }

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === selectedPurchase.id
          ? {
              ...p,
              review: newReview,
            }
          : p
      )
    )
    setRatingDialogOpen(false)
    setSelectedPurchaseId(null)
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
      {hasPermission && (
        <Scanner
          onScan={(result) => {
            if (result) {
              const val = result[0].rawValue
              // setQRtext(val)
              console.log(val)
              setIsPaused(true)
              scanPostamat(val).then((res) => {
                if (res) {
                  if (res.status === 'EMPTY') {
                    toast.info('В этом постамате нет ваших товаров!')
                  } else if (res.status === 'ID')
                    toast.info('Заберите ваш товар!')
                }
              })
              // setTimeout(() => setIsPaused(false), 1500)
            }
          }}
          onError={(error) => console.log(error)}
          formats={['qr_code']}
          components={{
            tracker: highlightCodeOnCanvas,
          }}
          paused={isPaused}
          constraints={{
            facingMode: 'environment',
            aspectRatio: 1,
            width: { ideal: 500 },
            height: { ideal: 500 },
          }}
        />
      )}
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
          Здесь пользователь видит свои покупки и может оценить товар и доставку
          после получения.
        </Typography>

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Активные посылки
        </Typography>

        {activePurchases.length === 0 && (
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            Активных посылок нет.
          </Typography>
        )}

        {activePurchases.length > 0 && (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {activePurchases.map((p) => (
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
                  <Typography fontWeight={600}>
                    {p.product?.name ?? 'Товар'}
                  </Typography>
                  <Chip
                    size="small"
                    label={formatDeliveryType(p.delivery_type)}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Номер покупки: {p.id}
                </Typography>
                {p.product && (
                  <Typography variant="body2" color="text.secondary">
                    Стоимость: {p.product.cost} ₸
                  </Typography>
                )}
                {p.delivery_type === 'BRANCH' && p.branch && (
                  <Typography variant="body2" color="text.secondary">
                    Отделение: {p.branch.adress}
                  </Typography>
                )}
                {p.delivery_type === 'POSTOMAT' && p.postomat && (
                  <Typography variant="body2" color="text.secondary">
                    Постамат: {p.postomat.adress}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#6f2dbd' }}
                    onClick={() => handleMarkAsReceived(p.id)}
                  >
                    Я забрал посылку
                  </Button>

                  {p.delivery_type === 'POSTOMAT' && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const slot = p.slot
                          ? `ячейка ${p.slot.id}`
                          : 'ячейка не указана'
                        const address = p.postomat
                          ? p.postomat.adress
                          : 'адрес постомата не указан'
                        alert(`Код для постамата\nАдрес: ${address}\n${slot}`)
                      }}
                    >
                      Код для постамата
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

        {deliveredPurchases.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            История полученных посылок появится после первой выдачи.
          </Typography>
        )}

        {deliveredPurchases.length > 0 && (
          <Stack spacing={1.5}>
            {deliveredPurchases.map((p) => (
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
                  <Typography fontWeight={600}>
                    {p.product?.name ?? 'Товар'}
                  </Typography>
                  <Chip
                    size="small"
                    label="Получена"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Номер покупки: {p.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Способ: {formatDeliveryType(p.delivery_type)}
                </Typography>
                {p.review ? (
                  <Typography variant="body2" color="text.secondary">
                    Оценка товара: {p.review.points_product}, доставка:{' '}
                    {p.review.points_delivery}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Для этой посылки оценка ещё не оставлена.
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  sx={{ mt: 1, borderColor: '#6f2dbd', color: '#6f2dbd' }}
                  onClick={() => handleOpenRating(p.id)}
                >
                  Оценить товар и доставку
                </Button>
              </Paper>
            ))}
          </Stack>
        )}

        <Dialog open={ratingDialogOpen} onClose={handleCloseDialog} fullWidth>
          <DialogTitle>Оценка товара и доставки</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {selectedPurchase && (
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                Покупка №{selectedPurchase.id} (
                {selectedPurchase.product?.name ?? 'Товар'})
              </Typography>
            )}

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Оценка товара
                </Typography>
                <Rating
                  value={rating.pointsProduct}
                  onChange={(_, value) =>
                    setRating((prev) => ({
                      ...prev,
                      pointsProduct: value,
                    }))
                  }
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Оценка доставки
                </Typography>
                <Rating
                  value={rating.pointsDelivery}
                  onChange={(_, value) =>
                    setRating((prev) => ({
                      ...prev,
                      pointsDelivery: value,
                    }))
                  }
                />
              </Box>
              <TextField
                label="Комментарий к товару или доставке"
                multiline
                minRows={3}
                value={rating.content}
                onChange={(e) =>
                  setRating((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: '#6f2dbd' }}
              onClick={handleSubmitRating}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  )
}
