import { Router } from 'express'
import {
  signIn,
  signUp,
  getUsers,
  googleAuth,
} from '../controllers/authController.js'

const router = Router()

router.post('/signin', signIn)
router.post('/signup', signUp)
router.get('/users', getUsers)
router.post('/google', googleAuth)

export default router
