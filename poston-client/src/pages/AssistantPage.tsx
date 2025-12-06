import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'
import { askAssistant } from '../http/API'

const AssistantPage = () => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const askQuestion = async () => {
    setError(null)
    setAnswer(null)
    if (!question.trim()) {
      setError('Введите вопрос')
      return
    }
    setLoading(true)
    const data = await askAssistant(question)
    if (!data) {
      setError('Ошибка при получении ответа')
      setLoading(false)
      return
    }
    setAnswer(data)
    setLoading(false)
  }

  return (
    <div>
      <Typography variant="h2">AI Ассистент</Typography>
      <Typography>
        Задайте вопрос, и искусственный интеллект ответит на него.
      </Typography>
      <Box>
        <textarea
          rows={4}
          cols={50}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ваш вопрос..."
        />
      </Box>
      <Button
        onClick={askQuestion}
        disabled={loading}
        style={{ marginTop: '5px' }}
      >
        {loading ? 'Запрос...' : 'Спросить'}
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {answer && (
        <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
          <strong>Ответ:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}

export default AssistantPage
