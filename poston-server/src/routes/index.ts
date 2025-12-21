import { Router } from 'express'
import authRouter from './authRouter.js'
import userRouter from './userRouter.js'
import ordersRouter from './orders.js'
import purchaseRouter from './purchaseRouter.js'
import accessLevel from '../middleware/accessLevel.js'
import postomatRouter from './postomatRouter.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/orders', ordersRouter)

router.use(
  '/user',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER', 'POSTAMAT']),
  userRouter
)

router.use(
  '/purchase',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER', 'POSTAMAT']),
  purchaseRouter
)

router.use(
  '/postomat',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER', 'POSTAMAT']),
  postomatRouter
)

export default router
