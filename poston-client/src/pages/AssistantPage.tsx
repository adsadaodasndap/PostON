import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const AssistantPage: React.FC = () => {
  const { token } = useContext(AuthContext)
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
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/assistant/ask`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Ошибка обращения к ассистенту')
      }
      setAnswer(data.answer)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>AI Ассистент</h2>
      <p>Задайте вопрос, и искусственный интеллект ответит на него.</p>
      <div>
        <textarea
          rows={4}
          cols={50}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ваш вопрос..."
        />
      </div>
      <button
        onClick={askQuestion}
        disabled={loading}
        style={{ marginTop: '5px' }}
      >
        {loading ? 'Запрос...' : 'Спросить'}
      </button>
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
