import { Router } from 'express'
import { signIn, signUp, getUsers } from '../controllers/authController'

// @ts-expect-error ????
const router = new Router()

router.post('/signin', signIn)
router.post('/signup', signUp)
router.get('/users', getUsers)

export default router
