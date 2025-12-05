import { Socket } from 'socket.io'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User } from '../../db/models.js'
import cfg from '../../config.js'

export const sio_middleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization
    if (!token) {
      return next(new Error('Unauthorized: no token provided'))
    }
    const jwtToken = token.startsWith('Bearer ') ? token.slice(7) : token
    const decoded = jwt.verify(jwtToken, cfg.SECRET_KEY) as JwtPayload
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return next(new Error('Unauthorized: invalid user'))
    }
    socket.data.user = user
    return next()
  } catch (e) {
    console.log('Socket auth error:', e)
    return next(new Error('Unauthorized'))
  }
}
