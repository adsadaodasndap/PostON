import { Router } from 'express'
import {
  createPurchase,
  getPurchases,
  assignCourier,
  markDelivered,
} from '../controllers/purchaseController'
import accessLevel from '../middleware/accessLevel'

// @ts-expect-error ????
const router = new Router()

router.get('/', getPurchases)
router.post('/', accessLevel(['BUYER']), createPurchase)
router.put('/:id/assign', accessLevel(['ADMIN']), assignCourier)
router.put('/:id/deliver', accessLevel(['ADMIN', 'COURIER']), markDelivered)

export default router
