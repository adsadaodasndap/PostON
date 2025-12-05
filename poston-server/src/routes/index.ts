import { Router } from 'express'
import authRouter from './authRouter.js'
import userRouter from './userRouter.js'
import accessLevel from '../middleware/accessLevel.js'

const router = Router()

router.use('/auth', authRouter)
router.use(
  '/user',
  accessLevel(['ADMIN', 'SELLER', 'BUYER', 'COURIER']),
  userRouter
)
// router.use('/admin', accessLevel(['ADMIN']), adminRouter);

export default router
