import { Response } from 'express'
import { Request } from '../types/Request.js'
import { User } from '../db/models.js'
import unexpectedError from '../helpers/unexpectedError.js'
import cfg from '../config.js'
import { OAuth2Client } from 'google-auth-library'
import { generateJwt } from '../helpers/generateJwt.js'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const googleClient = new OAuth2Client(cfg.GOOGLE_CLIENT_ID)

export const signUp = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password } = req.body
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'Введите все данныефвфывфыв' })
    }
    const candidate = await User.findOne({ where: { email } })
    if (candidate) {
      return res
        .status(409)
        .json({ message: 'Данная почта уже зарегистрирована' })
    }
    const activation_code = randomBytes(20).toString('hex')
    const hashPassword = bcrypt.hashSync(password, 10)
    const newUser = await User.create({
      name: `${first_name} ${last_name}`,
      email,
      password: hashPassword,
      activation_code,
      role: 'BUYER',
    })
    return res.status(201).json({
      message: 'Пользователь успешно зарегистрирован!',
      user: newUser,
      token: generateJwt(newUser.id, newUser.role),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Введите все данные' })
    }
    const candidate = await User.findOne({ where: { email } })
    if (!candidate) {
      return res.status(401).json({ message: 'Пользователь не существует' })
    }
    const validPassword = bcrypt.compareSync(password, candidate.password)
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный пароль' })
    }
    return res.json({
      message: `Добро пожаловать, ${candidate.name}`,
      user: candidate,
      token: generateJwt(candidate.id, candidate.role),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.query
    if (id && typeof id === 'string') {
      const user = await User.findByPk(id)
      return res.json({ user })
    } else {
      const users = await User.findAll()
      return res.json({ users })
    }
  } catch (e) {
    return unexpectedError(res, e)
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
    if (!email) {
      return res.status(400).json({ message: 'Invalid token' })
    }
    let user = await User.findOne({ where: { email } })
    if (!user) {
      user = await User.create({
        name: `${payload?.given_name} ${payload?.family_name}`,
        email,
        password: bcrypt.hashSync('googleauthextpassword', 10),
        role: 'BUYER',
        is_google: true,
        active: true,
      })
    }
    return res.json({
      message: `Добро пожаловать, ${user.name}!`,
      user,
      token: generateJwt(user.id, user.role),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
