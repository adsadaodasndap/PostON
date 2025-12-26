import { Router } from 'express'
import accessLevel from '../middleware/accessLevel'
import {
  createPurchase,
  getPurchases,
  assignCourier,
  markDelivered,
  markReceived,
  getCouriers,
} from '../controllers/purchaseController'

const router = Router()

router.get('/', getPurchases)
router.post('/', accessLevel(['BUYER']), createPurchase)

router.put('/:id/assign', accessLevel(['ADMIN']), assignCourier)
router.put('/:id/deliver', accessLevel(['ADMIN', 'COURIER']), markDelivered)
router.put('/:id/receive', accessLevel(['BUYER']), markReceived)

router.get('/couriers', accessLevel(['BUYER', 'ADMIN']), getCouriers)

export default router
