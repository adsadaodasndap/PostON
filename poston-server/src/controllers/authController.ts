import { Request, Response } from 'express'
import { User } from '../db/models'
import unexpectedError from './unexpectedError'

export const signUp = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password } = req.body

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({
        message: 'Введите все данные',
      })

    const candidate = await User.findOne({ where: { email } })

    if (candidate)
      return res.status(409).json({
        message: 'Данная почта уже зарегестрирована',
      })

    const newUser = await User.create({
      password,
      email,
      last_name,
      role: 'BUYER',
    })

    return res.status(201).json({
      message: 'Пользователь успешно заргестрирован!',
      user: newUser,
    })
  } catch (e) {
    unexpectedError(res, e)
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({
        message: 'Введите все данные',
      })

    const candidate = await User.findOne({ where: { email } })

    if (!candidate)
      return res.status(401).json({
        message: 'Пользователь не существует',
      })
    if (candidate.password !== password)
      return res.status(401).json({
        message: 'Неверный пароль',
      })

    return res.json({
      message: `Добро пожаловать, ${candidate.first_name}`,
      user: candidate,
    })
  } catch (e) {
    unexpectedError(res, e)
  }
}
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.query

    if (id && typeof id === 'string') {
      return res.json({ user: await User.findByPk(id) })
    } else {
      return res.json({
        users: await User.findAll(),
      })
    }
  } catch (e) {
    unexpectedError(res, e)
  }
}
