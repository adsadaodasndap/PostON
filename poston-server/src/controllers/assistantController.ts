import { Request, Response } from 'express'

type AskAssistantBody = {
  question?: string
  page?: string
}

type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type DeepSeekChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
    type?: string
  }
}

function buildSystemPrompt(page?: string) {
  return [
    'Ты - встроенный помощник сайта PostON.',
    'Твоя задача: кратко и по шагам отвечать на вопросы пользователя о функциях сайта и сценариях использования.',
    'Запрещено: придумывать функции, которых нет; выдавать персональные данные; обсуждать ключи/секреты; писать “как взломать”.',
    'Если информации не хватает - задай 1 уточняющий вопрос.',
    page ? `Контекст страницы: ${page}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function extractAnswer(data: DeepSeekChatCompletionResponse): string | null {
  const content = data.choices?.[0]?.message?.content
  if (!content) return null
  const cleaned = content.trim()
  return cleaned.length ? cleaned : null
}

export const askAssistant = async (req: Request, res: Response) => {
  try {
    const { question, page } = (req.body ?? {}) as AskAssistantBody

    const q = (question ?? '').trim()
    if (!q) return res.status(400).json({ message: 'question_required' })

    const apiKey = process.env.GPT_KEY
    if (!apiKey) {
      return res.status(500).json({ message: 'assistant_key_missing' })
    }

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: buildSystemPrompt(page) },
      { role: 'user', content: q },
    ]

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.2,
      }),
    })

    const data = (await resp.json()) as DeepSeekChatCompletionResponse

    if (!resp.ok) {
      const msg = data.error?.message || `deepseek_error_${resp.status}`
      return res.status(502).json({ message: msg })
    }

    const answer = extractAnswer(data)
    if (!answer)
      return res.status(502).json({ message: 'assistant_empty_answer' })

    return res.json({ answer })
  } catch (e: unknown) {
    console.error(e)
    return res.status(500).json({ message: 'assistant_unexpected_error' })
  }
}
