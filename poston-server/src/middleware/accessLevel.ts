import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Response } from 'express'
import { Request } from '../types/Request'
import { User } from '../db/models'
import cfg from '../config'

export default function accessLevel(roles: string[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      return next()
    }
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({ message: 'authorization_required' })
      }
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, cfg.SECRET_KEY) as JwtPayload
      if (!roles.includes(decoded.role as string)) {
        return res.status(403).json({ message: 'forbidden' })
      }
      const user = await User.findByPk(decoded.id)
      if (!user) {
        return res.status(403).json({ message: 'forbidden' })
      }
      req.user = user
      return next()
    } catch (e) {
      console.error('AccessLevel error:', e)
      return res.status(401).json({ message: 'authorization_required' })
    }
  }
}
