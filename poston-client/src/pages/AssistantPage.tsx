import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { askAssistant } from '../http/API'

type Msg = {
  role: 'user' | 'assistant'
  text: string
}

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      text: 'Задай вопрос про функции сайта PostON. Например: "Как курьеру положить посылку в постомат?"',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  )

  const send = async () => {
    setError(null)
    const q = input.trim()
    if (!q) return

    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const data = await askAssistant(q, 'assistant_page')
      if (!data?.answer) {
        setError('Не удалось получить ответ')
        setLoading(false)
        return
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }])
    } catch {
      setError('Ошибка сети/сервера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        AI-ассистент PostON
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
        Помощь по интерфейсу и сценариям сайта. Ничего не сохраняется.
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: 2,
          height: '60vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
          borderRadius: 2,
        }}
      >
        {messages.map((m, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '80%',
                p: 1.2,
                borderRadius: 2,
                bgcolor: m.role === 'user' ? 'primary.main' : 'grey.100',
                color:
                  m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.35,
              }}
            >
              {m.text}
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 2,
                bgcolor: 'grey.100',
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2">Думаю…</Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {error && (
        <Typography sx={{ color: 'error.main', mt: 1 }}>{error}</Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Например: "Как отсканировать QR курьеру?"'
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSend) void send()
            }
          }}
        />
        <Button
          variant="contained"
          disabled={!canSend}
          onClick={() => void send()}
        >
          Отправить
        </Button>
      </Box>
    </Box>
  )
}
