import { Router } from 'express'
import {
  createPurchase,
  getPurchases,
  assignCourier,
  markDelivered,
  markReceived,
  courierScanAtPostomat,
  courierOpenDoor,
  courierPlaceParcel,
  courierCloseDoor,
  clientScanQr,
  clientPickupParcel,
} from '../controllers/purchaseController'

import accessLevel from '../middleware/accessLevel'
import { getCouriers } from '../controllers/purchaseController'
import { courierScanQr } from '../controllers/purchaseController'

const router = Router()

router.get('/', getPurchases)
router.post('/', accessLevel(['BUYER']), createPurchase)
router.put('/:id/assign', accessLevel(['ADMIN']), assignCourier)
router.put('/:id/deliver', accessLevel(['ADMIN', 'COURIER']), markDelivered)
router.put('/:id/receive', accessLevel(['BUYER']), markReceived)
// courier → postomat flow
router.post('/postomat/scan', accessLevel(['COURIER']), courierScanAtPostomat)
router.post('/:id/door/open', accessLevel(['COURIER']), courierOpenDoor)
router.post('/:id/place', accessLevel(['COURIER']), courierPlaceParcel)
router.post('/:id/door/close', accessLevel(['COURIER']), courierCloseDoor)

router.post('/client/scan', accessLevel(['BUYER']), clientScanQr)
router.post('/:id/pickup', accessLevel(['BUYER']), clientPickupParcel)
router.get('/couriers', accessLevel(['BUYER', 'ADMIN']), getCouriers)
// router.put(
// '/:id/placed',
// accessLevel(['ADMIN', 'COURIER']),
// markPlacedToPostomat
// )
router.post('/postomat/courier/scan', accessLevel(['COURIER']), courierScanQr)

export default router
