import { Request, Response } from 'express'
import axios from 'axios'
import cfg from '../config'
import unexpectedError from '../helpers/unexpectedError'

export const askGPT = async (req: Request, res: Response) => {
  try {
    const { question } = req.body
    if (!question) {
      return res.status(400).json({ message: 'Не задан вопрос для AI' })
    }
    const apiKey = cfg.GPT_KEY
    if (!apiKey || apiKey === 'xxxx') {
      return res.status(500).json({ message: 'API-ключ GPT не настроен' })
    }
    const response = await axios.post(
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
      response.data.choices?.[0]?.message?.content || 'Извините, нет ответа.'
    return res.json({ answer })
  } catch (e: any) {
    if (e.response && e.response.data) {
      return res
        .status(500)
        .json({ message: 'GPT Error: ' + JSON.stringify(e.response.data) })
    }
    return unexpectedError(res, e)
  }
}
