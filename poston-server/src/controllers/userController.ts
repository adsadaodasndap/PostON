import { Response } from 'express'
import { Request } from '../types/Request'
import { User } from '../db/models'
import { generateJwt } from '../helpers/generateJwt'
import unexpectedError from '../helpers/unexpectedError'
import bot from '../modules/telegram'
import { confEmail } from '../modules/email/confEmail'

export const sendConfEmail = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    if (!req.user.activation_code) {
      // Если по какой-то причине нет кода, сгенерируем новый
      const newCode = Math.floor(100000 + Math.random() * 900000).toString()
      await User.update(
        { activation_code: newCode },
        { where: { id: req.user.id } }
      )
      req.user.activation_code = newCode
    }
    await confEmail(req.user.email, req.user.activation_code)
    return res.json({ message: 'Письмо отправлено!' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    if (req.user.active) {
      return res.json({ message: 'Почтовый адрес уже подтвержден!' })
    }
    if (req.body.secret === req.user.activation_code) {
      await User.update({ active: true }, { where: { id: req.user.id } })
      return res.json({ message: 'Почтовый адрес подтвержден!' })
    } else {
      return res.status(400).json({ message: 'Ошибка подтверждения почты!' })
    }
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const bindTelegram = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { tg_id } = req.body
    if (!tg_id) return res.status(400).json({ message: 'Введите TG ID!' })
    await User.update({ tg_id }, { where: { id: req.user.id } })
    // При желании, отправим приветствие в Telegram:
    // await bot.telegram.sendMessage(tg_id, 'Telegram привязан к аккаунту PostON!')
    return res.json({ message: 'Telegram привязан!' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const sendTelegram = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { message } = req.body
    if (!message)
      return res.status(400).json({ message: 'Введите текст сообщения!' })
    if (req.user.tg_id) {
      await bot.telegram.sendMessage(
        req.user.tg_id,
        '📡 Сообщение с сайта: ' + message
      )
      return res.json({ message: 'Отправлено!' })
    } else {
      return res.status(400).json({ message: 'У вас не привязан Telegram!' })
    }
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const verify = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { password: _, activation_code: __, ...userData } = req.user.toJSON()
    // Обновляем JWT (продлеваем сессию)
    const newToken = generateJwt(req.user.id, req.user.role)
    return res.json({ user: userData, token: newToken })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
