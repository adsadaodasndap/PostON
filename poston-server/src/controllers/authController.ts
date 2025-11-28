import { Request, Response } from 'express'
import { User } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'
import cfg from '../config'
import { OAuth2Client } from 'google-auth-library'
import { generateJwt } from '../helpers/generateJwt'
import bcrypt from 'bcryptjs'

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
      name: first_name + ' ' + last_name,
      role: 'BUYER',
    })

    return res.status(201).json({
      message: 'Пользователь успешно зарегистрирован!',
      user: newUser,
      token: generateJwt(newUser.id, newUser.role),
    })
  } catch (e) {
    unexpectedError(res, e)
  }
}

const googleClient = new OAuth2Client(cfg.GOOGLE_CLIENT_ID)

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
      message: `Добро пожаловать, ${candidate.name}`,
      user: candidate,
      token: generateJwt(candidate.id, candidate.role),
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
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: cfg.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const email = payload?.email

    if (!email) return res.status(400).json({ message: 'Invalid token' })

    let user = await User.findOne({ where: { email } })
    if (!user) {
      user = await User.create({
        email,
        name: payload.given_name + ' ' + payload.family_name,
        // photoURL: payload.picture,
        password: bcrypt.hashSync('googleauthextpassword'),
        role: 'BUYER',
      })
    }

    if (user) {
      return res.json({
        message: `Добро пожаловать, ${user.name}!`,
        user,
        token: generateJwt(user.id, user.role),
      })
    }
  } catch (e) {
    unexpectedError(res, e)
  }
}
