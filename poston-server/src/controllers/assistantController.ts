import type { Request, Response } from 'express'
import axios from 'axios'
import cfg from '../config.js'
import unexpectedError from '../helpers/unexpectedError.js'

type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

export const askGPT = async (req: Request, res: Response) => {
  try {
    const question = String(
      (req.body as { question?: unknown })?.question ?? ''
    ).trim()

    if (!question) {
      return res.status(400).json({ message: 'Не задан вопрос для AI' })
    }

    const apiKey = cfg.GPT_KEY
    if (!apiKey || apiKey === 'xxxx') {
      return res.status(500).json({ message: 'API-ключ GPT не настроен' })
    }

    const response = await axios.post<OpenAIChatCompletionResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    )

    const answer =
      response.data.choices?.[0]?.message?.content ?? 'Извините, нет ответа.'
    return res.json({ answer })
  } catch (err: unknown) {
    // типобезопасная обработка axios-ошибок без any
    if (axios.isAxiosError(err)) {
      return res.status(err.response?.status ?? 500).json({
        message: 'GPT Error',
        details: err.response?.data ?? err.message,
      })
    }

    return unexpectedError(res, err)
  }
}
