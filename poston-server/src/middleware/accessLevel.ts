import jwt, { JwtPayload } from 'jsonwebtoken'
import { User } from '../db/models.js'
import cfg from '../config.js'
import { NextFunction, Request, Response } from 'express'
// import { Request } from '../types/Request.js'

export default function accessLevel(roles: string[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      return next()
    }
    try {
      const token = req.headers.authorization
      if (!token) {
        return res.status(401).json({ message: 'authorization_required' })
      }
      const decoded = jwt.verify(
        token.split(' ')[1],
        cfg.SECRET_KEY
      ) as JwtPayload
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'forbidden' })
      }
      const user = await User.findByPk(decoded.id)
      if (!user) {
        return res.status(403).json({ message: 'forbidden2' })
      }
      // @ts-expect-error user is defined
      req.user = user
      return next()
    } catch (e) {
      console.log('error', e)
      return res.status(401).json({ message: 'authorization_required' })
    }
  }
}
