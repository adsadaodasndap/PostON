import { Router } from 'express'
import {
  createPurchase,
  getPurchases,
  assignCourier,
  markDelivered,
  markReceived,
} from '../controllers/purchaseController'
import accessLevel from '../middleware/accessLevel'
import { getCouriers } from '../controllers/purchaseController'

const router = Router()

router.get('/', getPurchases)
router.post('/', accessLevel(['BUYER']), createPurchase)
router.put('/:id/assign', accessLevel(['ADMIN']), assignCourier)
router.put('/:id/deliver', accessLevel(['ADMIN', 'COURIER']), markDelivered)
router.put('/:id/receive', accessLevel(['BUYER']), markReceived)
router.get('/couriers', accessLevel(['BUYER', 'ADMIN']), getCouriers)
// router.put(
// '/:id/placed',
// accessLevel(['ADMIN', 'COURIER']),
// markPlacedToPostomat
// )

export default router
