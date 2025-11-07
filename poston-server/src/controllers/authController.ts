import { Request, Response } from 'express'
import unexpectedError from './unexpectedError'
import { randomUUID } from 'crypto'

type User = {
  first_name: string
  last_name: string
  email: string
  password: string
}
const userStore: User[] = []

export const signUp = (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password } = req.body

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({
        message: 'Введите все данные',
      })

    const candidate = userStore.find((u) => u.email === email)

    if (candidate)
      return res.status(409).json({
        message: 'Данная почта уже зарегестрирована',
      })

    const newUser = {
      id: randomUUID(),
      first_name,
      last_name,
      email,
      password,
    }

    userStore.push(newUser)

    return res.status(201).json({
      message: 'Пользователь успешно заргестрирован!',
      user: newUser,
    })
  } catch (e) {
    unexpectedError(res, e)
  }
}

export const signIn = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({
        message: 'Введите все данные',
      })

    const candidate = userStore.find((u) => u.email === email)

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
export const getUsers = (req: Request, res: Response) => {
  try {
    return res.json({
      users: userStore,
    })
  } catch (e) {
    unexpectedError(res, e)
  }
}
