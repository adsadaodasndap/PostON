import { ExtendedError, Socket } from 'socket.io'
import { sendGPT } from '../gpt/.'
import jwt, { JwtPayload } from 'jsonwebtoken'
import cfg from '../../config'

const messages = [
  {
    role: 'system',
    content:
      'Представь, что ты холодильник из Ташкента, отвечай на русском языке',
  },
]

export interface SocketU extends Socket {
  user_id?: number
}

export const sio_middleware = (
  socket: SocketU,
  next: (err?: ExtendedError | undefined) => void
) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('No token provided'))
  }

  try {
    const decoded = jwt.verify(token, cfg.SECRET_KEY) as JwtPayload
    const user_id = decoded.id

    if (user_id) {
      console.log(user_id)
      socket.user_id = user_id
    }
    next()
  } catch {
    return next(new Error('Invalid token'))
  }
}

export const sio_chat = (socket: SocketU) => {
  console.log('User connected', socket.id)
  let msg = 'Отложенный привет! #'
  let i = 0
  setInterval(() => {
    i += 1
    socket.emit('message', {
      msg: msg + i,
    })
  }, 1500)

  socket.on('message', (m) => {
    console.log('Received message: ', m)
    msg = m
  })

  socket.on('gptmessage', async (m) => {
    messages.push({
      role: 'user',
      content: m,
    })
    console.log('Receive GPT:', m)

    const gpt_response = await sendGPT(messages)

    console.log('GPT resp: ', gpt_response)

    if (gpt_response) {
      socket.emit('gptmessage', gpt_response)
    }
  })

  socket.on('disconnect', (m) => {
    console.log('Disconnected user: ', m)
  })
}
