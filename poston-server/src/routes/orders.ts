import { Router } from 'express'
import accessLevel from '../middleware/accessLevel'
import { createOrder } from '../controllers/ordersController'

const router = Router()

router.post('/', accessLevel(['BUYER', 'SELLER', 'ADMIN']), createOrder)

export default router
