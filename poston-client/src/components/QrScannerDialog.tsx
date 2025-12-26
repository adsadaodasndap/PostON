import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { toast } from 'react-toastify'
import { Scanner } from '@yudiel/react-qr-scanner'

const highlightCodeOnCanvas = (detectedCodes: any, ctx: any) => {
  detectedCodes.forEach((detectedCode: any) => {
    const { boundingBox, cornerPoints } = detectedCode

    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 4
    ctx.strokeRect(
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    )

    ctx.fillStyle = '#FF0000'
    cornerPoints.forEach((point: any) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
      ctx.fill()
    })
  })
}

type Props = {
  open: boolean
  onClose: () => void
  onDetected: (value: string) => void
}

export default function QrScannerDialog({ open, onClose, onDetected }: Props) {
  const [isPaused, setIsPaused] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    if (!open) return

    const request = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        setHasPermission(true)
      } catch (e) {
        console.log(e)
        setHasPermission(false)
        toast.error('Нет доступа к камере')
      }
    }

    request()
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Сканирование QR</DialogTitle>

      <DialogContent>
        {hasPermission === false && (
          <Typography color="error">
            Доступ к камере отклонён. Разреши камеру в настройках браузера.
          </Typography>
        )}

        {hasPermission === true && (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Scanner
              onScan={(result) => {
                if (!result || !result[0]?.rawValue) return
                const val = String(result[0].rawValue).trim()
                if (!val) return

                onDetected(val)

                setIsPaused(true)
                setTimeout(() => setIsPaused(false), 800)

                onClose()
              }}
              onError={(error) => console.log(error)}
              formats={['qr_code']}
              components={{ tracker: highlightCodeOnCanvas }}
              paused={isPaused}
              constraints={{
                facingMode: 'environment',
                aspectRatio: 1,
                width: { ideal: 500 },
                height: { ideal: 500 },
              }}
            />

            <Typography variant="body2" color="text.secondary">
              Наведи камеру на QR-код. После считывания значение подставится
              автоматически.
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  )
}
