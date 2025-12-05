import { Router } from 'express'
import {
  getPostomats,
  getPostomatSlots,
} from '../controllers/postomatController'

const router = Router()
router.get('/', getPostomats)
router.get('/:id/slots', getPostomatSlots)

export default router
