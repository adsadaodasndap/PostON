import { Router } from 'express'
import {
  signIn,
  signUp,
  getUsers,
  googleAuth,
} from '../controllers/authController'

// @ts-expect-error ????
const router = new Router()

router.post('/signin', signIn)
router.post('/signup', signUp)
router.get('/users', getUsers)
router.post('/google', googleAuth)

export default router
