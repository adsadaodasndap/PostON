import type { Response } from 'express'
import type { Request } from '../types/Request.js'
import { User } from '../db/models.js'
import { generateJwt } from '../helpers/generateJwt.js'
import unexpectedError from '../helpers/unexpectedError.js'
import bot from '../modules/telegram/index.js'
import { confEmail } from '../modules/email/confEmail.js'

/**
 * Требует авторизованного пользователя.
 * Возвращает user или делает 401 и возвращает null.
 */
const requireUser = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Не авторизован' })
    return null
  }
  return req.user
}

export const sendConfEmail = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req, res)
    if (!user) return

    await confEmail(user.email, user.activation_code)
    return res.json({ message: 'Письмо отправлено!' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req, res)
    if (!user) return

    if (user.active) {
      return res.json({ message: 'Почтовый адрес уже подтвержден!' })
    }

    if (req.body.secret === user.activation_code) {
      await User.update({ active: true }, { where: { id: user.id } })
      return res.json({ message: 'Почтовый адрес подтвержден!' })
    }

    return res.status(400).json({ message: 'Ошибка подтверждения почты!' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const bindTelegram = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req, res)
    if (!user) return

    const { tg_id } = req.body
    if (!tg_id) {
      return res.status(400).json({ message: 'Введите TG ID!' })
    }

    await User.update({ tg_id }, { where: { id: user.id } })
    return res.json({ message: 'Telegram привязан!' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const sendTelegram = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req, res)
    if (!user) return

    const { message } = req.body
    if (!user.tg_id) {
      return res.status(400).json({ message: 'У вас не привязан TG ID!' })
    }

    await bot.telegram.sendMessage(
      user.tg_id,
      '📡 Сообщение с сайта: ' + message
    )
    return res.json({ message: 'Отправлено!' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const verify = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req, res)
    if (!user) return

    return res.json({
      user,
      token: generateJwt(user.id, user.role),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
