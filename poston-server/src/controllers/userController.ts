import { Response } from 'express'
import { Request } from '../types/Request'

import { User } from '../db/models'
import { generateJwt } from '../helpers/generateJwt'
import unexpectedError from '../helpers/unexpectedError'
import bot from '../modules/telegram'
import { confEmail } from '../modules/email/confEmail'

export const sendConfEmail = async (req: Request, res: Response) => {
  try {
    await confEmail(req.user.email, req.user.activation_code)
    return res.json({
      message: 'Письмо отправлено!',
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    if (req.user.active) {
      return res.json({
        message: 'Почтовый адрес уже подтвержден!',
      })
    } else if (req.body.secret === req.user.activation_code) {
      await User.update({ active: true }, { where: { id: req.user.id } })
      return res.json({
        message: 'Почтовый адрес подтвержден!',
      })
    } else {
      return res.status(400).json({
        message: 'Ошибка подтверждения почты!',
      })
    }
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const bindTelegram = async (req: Request, res: Response) => {
  try {
    const { tg_id } = req.body

    if (!tg_id) return res.status(400).json({ message: 'Введите TG ID!' })

    User.update({ tg_id }, { where: { id: req.user.id } })

    // bot.telegram.sendMessage(tg_id, 'Hello')

    return res.json({ message: 'Telegram привязан!' })
  } catch (e) {
    unexpectedError(res, e)
  }
}

export const sendTelegram = async (req: Request, res: Response) => {
  try {
    const { message } = req.body

    if (req.user.tg_id) {
      await bot.telegram.sendMessage(
        req.user.tg_id,
        '📡 Сообщение с сайта: ' + message
      )
      return res.json({ message: 'Отправлено!' })
    } else {
      return res.status(400).json({ message: 'У вас не привязан TG ID!' })
    }
  } catch (e) {
    unexpectedError(res, e)
  }
}

export const verify = async (req: Request, res: Response) => {
  try {
    return res.json({
      user: req.user,
      token: generateJwt(req.user.id, req.user.role),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
