import { Router } from 'express'
import {
  signIn,
  signUp,
  getUsers,
  googleAuth,
} from '../controllers/authController'
import accessLevel from '../middleware/accessLevel'

const router = Router()
router.post('/signin', signIn)
router.post('/signup', signUp)
router.post('/google', googleAuth)
// Список всех пользователей - только администратор
router.get('/users', accessLevel(['ADMIN']), getUsers)

export default router
