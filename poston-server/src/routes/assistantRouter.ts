import { Router } from 'express'
import { askGPT } from '../controllers/assistantController'

// @ts-expect-error ????
const router = new Router()
router.post('/ask', askGPT)

export default router
