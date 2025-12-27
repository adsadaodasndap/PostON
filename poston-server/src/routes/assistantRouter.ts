import { Router } from 'express'
import { askAssistant } from '../controllers/assistantController'

const router = Router()

router.post('/ask', askAssistant)

export default router
