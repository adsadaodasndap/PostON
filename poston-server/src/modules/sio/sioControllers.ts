import { Socket } from 'socket.io'

export const sio_chat = (socket: Socket) => {
  console.log('User connected', socket.id)

  socket.on('message', (m) => {
    console.log('Received message:', m)
  })

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, reason)
  })
}
