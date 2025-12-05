import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { User } from '../db/models'
import cfg from '../config'
import { generateJwt } from '../helpers/generateJwt'
import unexpectedError from '../helpers/unexpectedError'

const googleClient = new OAuth2Client(cfg.GOOGLE_CLIENT_ID)

export const signUp = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password } = req.body
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'Введите все данные' })
    }
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Данная почта уже зарегистрирована' })
    }
    // Генерация кода активации
    const activation_code = Math.floor(
      100000 + Math.random() * 900000
    ).toString()
    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = await User.create({
      name: first_name + ' ' + last_name,
      email,
      password: hashedPassword,
      role: 'BUYER',
      activation_code,
      active: false,
    })
    // Убираем пароль и код из ответа
    const { password: _, activation_code: __, ...userData } = newUser.toJSON()
    return res.status(201).json({
      message: 'Пользователь успешно зарегистрирован!',
      user: userData,
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
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не существует' })
    }
    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный пароль' })
    }
    const { password: _, activation_code: __, ...userData } = user.toJSON()
    return res.json({
      message: `Добро пожаловать, ${user.name}`,
      user: userData,
      token: generateJwt(user.id, user.role),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body
    if (!idToken) {
      return res.status(400).json({ message: 'Token not provided' })
    }
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
        email,
        name: (payload?.given_name || '') + ' ' + (payload?.family_name || ''),
        password: bcrypt.hashSync('googleauthdefault', 10),
        role: 'BUYER',
        is_google: true,
        active: true,
      })
    }
    const { password: _, activation_code: __, ...userData } = user.toJSON()
    return res.json({
      message: `Добро пожаловать, ${user.name}!`,
      user: userData,
      token: generateJwt(user.id, user.role),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { id, role } = req.query
    if (id) {
      const user = await User.findByPk(id.toString())
      if (!user) return res.status(404).json({ message: 'User not found' })
      const { password: _, activation_code: __, ...userData } = user.toJSON()
      return res.json({ user: userData })
    }
    let users: User[]
    if (role) {
      users = await User.findAll({ where: { role: role.toString() } })
    } else {
      users = await User.findAll()
    }
    const safeUsers = users.map((u) => {
      const obj = u.toJSON()
      delete obj.password
      delete obj.activation_code
      return obj
    })
    return res.json({ users: safeUsers })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
