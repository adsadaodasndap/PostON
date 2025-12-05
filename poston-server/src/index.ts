import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import fileUpload from 'express-fileupload'
import cfg from './config'
import router from './routes'
import sequelize from './db/db'
import { sio_middleware, sio_chat } from './modules/sio'
import bot from './modules/telegram'
import './modules/cron'

const PORT = cfg.PORT
const app = express()

// Запуск Telegram-бота
bot.launch()

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '2mb' }))
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))
// Статическая папка для загрузок
app.use('/f', express.static('static'))
// API маршруты
app.use('/', router)
// Тестовый маршрут
app.get('/', (req, res) => {
  res.send({ msg: `Server works on port ${PORT}` })
})
// Разрешаем CORS заголовки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// HTTP и WebSocket сервер
const server = http.createServer(app)
export const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/ws',
  transports: ['websocket'],
})

// Socket.io middleware и обработчик
io.use(sio_middleware)
io.on('connection', sio_chat)

// Запуск приложения
const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (e) {
    console.error('Failed to start server:', e)
  }
}
start()
