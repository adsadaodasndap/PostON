// src/components/QrScannerDialog.tsx
import { useEffect, useMemo, useState } from 'react'
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

type Point = { x: number; y: number }

type BoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

type DetectedCode = {
  rawValue?: string
  boundingBox: BoundingBox
  cornerPoints: Point[]
}

type TrackerFn = (
  detectedCodes: DetectedCode[],
  ctx: CanvasRenderingContext2D
) => void

const highlightCodeOnCanvas: TrackerFn = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
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
    for (const point of cornerPoints) {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
      ctx.fill()
    }
  }
}

type Props = {
  open: boolean
  onClose: () => void
  onDetected: (value: string) => void
}

export default function QrScannerDialog({ open, onClose, onDetected }: Props) {
  const [isPaused, setIsPaused] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  // Удобно: не пересоздавать объект components на каждом рендере
  const scannerComponents = useMemo(
    () => ({ tracker: highlightCodeOnCanvas }),
    []
  )

  // Запрос доступа к камере при открытии
  useEffect(() => {
    if (!open) return

    let cancelled = false

    const request = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        if (!cancelled) setHasPermission(true)
      } catch (e) {
        console.log(e)
        if (!cancelled) setHasPermission(false)
        toast.error('Нет доступа к камере')
      }
    }

    request()

    return () => {
      cancelled = true
      // Когда диалог закрыли — паузим сканер
      setIsPaused(true)
      // и сразу снимаем паузу, чтобы при следующем open нормально стартовало
      window.setTimeout(() => setIsPaused(false), 0)
    }
  }, [open])

  // Доп. закрытие через клавиши (ESC — стандартно у Dialog, Enter оставляем по твоей просьбе)
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={(_, reason) => {
        // Важно: MUI сам закрывает по Escape / backdropClick.
        // Мы не блокируем, просто закрываем.
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') onClose()
        else onClose()
      }}
    >
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
                // Библиотека отдаёт массив, но типы у неё часто слабые,
                // поэтому здесь мы безопасно приводим к нашей форме.
                const list = (result as unknown as DetectedCode[]) ?? []
                const raw = list[0]?.rawValue
                const val = String(raw ?? '').trim()
                if (!val) return

                onDetected(val)

                setIsPaused(true)
                window.setTimeout(() => setIsPaused(false), 800)

                onClose()
              }}
              onError={(error) => console.log(error)}
              formats={['qr_code']}
              components={scannerComponents}
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
