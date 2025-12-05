import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import cfg from '../../config'

export const sio_middleware = (socket: Socket, next: (err?: any) => void) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Unauthorized'))
    }
    jwt.verify(token, cfg.SECRET_KEY)
    // Можно добавить информацию о пользователе в socket.data при необходимости
    return next()
  } catch (e) {
    console.error('Socket auth error:', e)
    return next(new Error('Unauthorized'))
  }
}
