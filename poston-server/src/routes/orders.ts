import { Router } from 'express'
import accessLevel from '../middleware/accessLevel'
import { createOrder } from '../controllers/ordersController'

// @ts-expect-error ????
const router = new Router()

router.post('/', accessLevel(['BUYER', 'SELLER', 'ADMIN']), createOrder)

export default router
