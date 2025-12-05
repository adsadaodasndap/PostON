import jwt from 'jsonwebtoken'
import cfg from '../config.js'

export const generateJwt = (id: number, role: string) => {
  return jwt.sign({ id, role }, cfg.SECRET_KEY, { expiresIn: '24h' })
}
