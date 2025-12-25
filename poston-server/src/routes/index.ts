import { Router } from 'express'
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
} from '../controllers/postomatController.js'

const router = Router()

router.post('/courier/scan', courierScanQR)
router.post('/courier/open', courierOpenDoor)
router.post('/courier/place', courierPlaceParcel)
router.post('/courier/close', courierCloseDoor)

router.post('/client/scan', clientScanQR)
router.post('/client/open', clientOpenDoor)
router.post('/client/take', clientTakeParcel)
router.post('/client/close', clientCloseDoor)

router.get('/slots', getPostomatSlots)

export default router
