import { Router } from 'express'
import {
  signIn,
  signUp,
  getUsers,
  googleAuth,
} from '../controllers/authController.js'
import { getProducts } from '../controllers/productController.js'

const router = Router()

router.post('/signin', signIn)
router.post('/signup', signUp)
router.get('/users', getUsers)
router.post('/google', googleAuth)
router.get('/products', getProducts)

export default router
