import { Router } from 'express'
import {
  signIn,
  signUp,
  getUsers,
  googleAuth,
  createUserByAdmin,
} from '../controllers/authController.js'
import { getProducts } from '../controllers/productController.js'
import accessLevel from '../middleware/accessLevel.js'

// @ts-expect-error ????
const router = new Router()

router.post('/signin', signIn)
router.post('/signup', signUp)
router.post('/google', googleAuth)

router.get('/products', getProducts)

router.get('/users', accessLevel(['ADMIN']), getUsers)
router.post('/users', accessLevel(['ADMIN']), createUserByAdmin)

export default router
