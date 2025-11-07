import { Router } from 'express'

import authRouter from './authRouter.js'
// import adminRouter from './adminRouter.js'
// import userRouter from './userRouter.js'
import accessLevel from '../middleware/accessLevel.js'

// @ts-expect-error ????
const router = new Router()

router.use('/auth', authRouter)
// router.use('/user', accessLevel(1), userRouter)
// router.use('/admin', accessLevel(2), adminRouter)

export default router