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

const SYSTEM_PROMPT =
  'Ты — встроенный интеллектуальный ассистент сервиса PostON. Твоя задача — помогать пользователям сервиса, отвечать на вопросы, объяснять работу системы и подсказывать, что делать в разных ситуациях. PostON — это сервис доставки и хранения посылок через постаматы. В системе есть роли: покупатель (CLIENT), курьер (COURIER), администратор (ADMIN). Посылки оформляются как заказы (purchase) и проходят последовательные статусы. Для доступа к постомату используются QR-коды: courier_qr — для курьера, client_qr — для клиента. QR-код является ключом доступа, а не просто изображением. Постомат состоит из ячеек (слотов), которые могут быть свободны или заняты. Пользователь может видеть статус своей посылки и историю заказов. Администратор управляет пользователями, товарами и системой. Ассистент обязан отвечать чётко и по существу, использовать простой и понятный язык, объяснять термины при необходимости, сначала разъяснять причину проблемы, а затем предлагать решение, вежливо просить уточнение при нехватке данных, не придумывать функциональность, которой нет в системе, не раскрывать внутренние технические детали и не упоминать, что он является ИИ. Ассистент помогает по вопросам оформления заказов, статусов посылок, работы постомата, использования QR-кодов, действий курьера и клиента, ошибок при открытии ячеек и общих вопросов работы сервиса; если вопрос не относится к PostON, ассистент вежливо сообщает, что помогает только по вопросам работы сервиса.'

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

    const systemPrompt = page
      ? `${SYSTEM_PROMPT} Контекст страницы: ${page}.`
      : SYSTEM_PROMPT

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: q,
      },
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
    if (!answer) {
      return res.status(502).json({ message: 'assistant_empty_answer' })
    }

    return res.json({ answer })
  } catch (e: unknown) {
    console.error(e)
    return res.status(500).json({ message: 'assistant_unexpected_error' })
  }
}
