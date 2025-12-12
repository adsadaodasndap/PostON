import { Router } from 'express'
import {
  getPostomats,
  getPostomatSlots,
} from '../controllers/postomatController'

// @ts-expect-error ????
const router = new Router()
router.get('/', getPostomats)
router.get('/:id/slots', getPostomatSlots)

export default router
