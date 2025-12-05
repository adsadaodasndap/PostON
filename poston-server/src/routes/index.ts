import { Router } from 'express'
import authRouter from './authRouter'
import userRouter from './userRouter'
import productRouter from './productRouter'
import purchaseRouter from './purchaseRouter'
import branchRouter from './branchRouter'
import postomatRouter from './postomatRouter'
import assistantRouter from './assistantRouter'
import accessLevel from '../middleware/accessLevel'

const router = Router()

router.use('/auth', authRouter)
// Доступ к маршрутам ниже только для авторизованных пользователей всех ролей
router.use(
  '/user',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER']),
  userRouter
)
router.use(
  '/products',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER']),
  productRouter
)
router.use(
  '/purchases',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER']),
  purchaseRouter
)
router.use(
  '/branches',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER']),
  branchRouter
)
router.use(
  '/postomats',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER']),
  postomatRouter
)
router.use(
  '/assistant',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER']),
  assistantRouter
)

export default router
