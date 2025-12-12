import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import fileUpload from 'express-fileupload'

import cfg from './config.js'
import router from './routes/index.js'
import sequelize from './db/db.js'
import { sio_middleware, sio_chat } from './modules/sio/index.js'
import bot from './modules/telegram/index.js'
import './modules/cron/index.js'
import ordersRouter from './routes/orders'
import { generateProducts } from './db/generateProducts.js'

const PORT = cfg.PORT

const app = express()

// bot.launch()

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '2mb' }))
app.use('/api/orders', ordersRouter)
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))
app.use('/f', express.static('static'))

app.use('/', router)

app.get('/', (req, res) => {
  res.send({ msg: `check on port ${PORT}!` })
})

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})
app.listen(3000, () => console.log('Server started'))

const server = http.createServer(app)
export const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/ws',
  transports: ['websocket'],
})

io.use(sio_middleware)
io.on('connection', sio_chat)

const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    await generateProducts()
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

start()
