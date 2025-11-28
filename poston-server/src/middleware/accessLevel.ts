import jwt, { JwtPayload } from 'jsonwebtoken'

import { User } from '../db/models.js'
import cfg from '../config.js'
import { NextFunction, Response } from 'express'
import { Request } from '../types/Request.js'

export default function (roles: string[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      next()
    }
    try {
      let role
      const token = req.headers.authorization
      if (!token) {
        return res.status(401).json({ message: 'authorization_required' })
      } else {
        const decoded = jwt.verify(
          token.split(' ')[1],
          cfg.SECRET_KEY
        ) as JwtPayload
        role = decoded.role
        if (!roles.includes(role)) {
          return res.status(403).json({ message: 'forbidden' })
        }
        const user = await User.findByPk(decoded.id)
        if (user) {
          req.user = user
          return next()
        }
        return res.status(403).json({ message: 'forbidden2' })
      }
    } catch (e) {
      console.log('error', e)
      return res.status(401).json({ message: 'authorization_required' })
    }
  }
}
