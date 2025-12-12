import { Router } from 'express'
import authRouter from './authRouter.js'
import userRouter from './userRouter.js'
import ordersRouter from './orders.js'
import accessLevel from '../middleware/accessLevel.js'

// @ts-expect-error ????
const router = new Router()

router.use('/auth', authRouter)
router.use('/orders', ordersRouter)
router.use(
  '/user',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER', 'POSTAMAT']),
  userRouter
)
// router.use('/admin', accessLevel(['ADMIN']), adminRouter);

export default router
