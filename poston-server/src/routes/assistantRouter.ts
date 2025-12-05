import { Router } from 'express'
import { askGPT } from '../controllers/assistantController'

const router = Router()
router.post('/ask', askGPT)

export default router
