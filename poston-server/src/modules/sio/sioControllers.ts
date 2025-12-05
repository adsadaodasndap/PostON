import { Socket } from 'socket.io'

export const sio_chat = (socket: Socket) => {
  console.log('User connected', socket.id)
  socket.on('message', (data) => {
    console.log('Received message:', data)
    socket.broadcast.emit('message', data)
    socket.emit('message', data)
  })
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id)
  })
}
