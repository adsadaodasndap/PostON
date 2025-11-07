import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import fileUpload from 'express-fileupload'

import cfg from './config.js'
import router from './routes/index.js'
import { sio_chat } from './controllers/sioControllers.js'
//import sequelize from './db.js'
//fimport { sio_chat, sio_middleware } from './controllers/sio_controller.js'

const PORT = cfg.PORT

const app = express()

app.use(
  cors({
    origin: '*',
  })
)

app.use(express.json({ limit: '2mb' }))
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
)

app.use('/f', express.static('static'))

app.use('/', router)
app.get('/', (req, res) => {
  res.send({ msg: `check on port ${PORT}!` })
})
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/ws',
  transports: ['websocket'],
})

//io.use(sio_middleware)

io.on('connection', sio_chat)

const start = async () => {
  try {
    // await sequelize.authenticate()
    // await sequelize.sync({
    //   // alter: true,
    // })

    server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

start()
