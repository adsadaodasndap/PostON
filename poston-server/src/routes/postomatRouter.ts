import { Router } from 'express'
import accessLevel from '../middleware/accessLevel'
import {
  courierScanQR,
  courierOpenDoor,
  courierPlaceParcel,
  courierCloseDoor,
  clientScanQR,
  clientOpenDoor,
  clientTakeParcel,
  clientCloseDoor,
  getPostomatSlots,
} from '../controllers/postomatController'

const router = Router()

router.get(
  '/slots',
  accessLevel(['ADMIN', 'COURIER', 'POSTAMAT']),
  getPostomatSlots
)

router.post('/courier/scan', accessLevel(['COURIER']), courierScanQR)
router.post('/courier/open', accessLevel(['COURIER']), courierOpenDoor)
router.post('/courier/place', accessLevel(['COURIER']), courierPlaceParcel)
router.post('/courier/close', accessLevel(['COURIER']), courierCloseDoor)

router.post('/client/scan', accessLevel(['BUYER']), clientScanQR)
router.post('/client/open', accessLevel(['BUYER']), clientOpenDoor)
router.post('/client/take', accessLevel(['BUYER']), clientTakeParcel)
router.post('/client/close', accessLevel(['BUYER']), clientCloseDoor)

export default router
