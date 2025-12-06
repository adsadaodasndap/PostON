import { Router } from 'express'
import {
  bindTelegram,
  confirmEmail,
  sendConfEmail,
  sendTelegram,
  verify,
} from '../controllers/userController.js'
import { getProducts } from '../controllers/productController.js'

const router = Router()

router.post('/verify', verify)
router.post('/email', sendConfEmail)
router.post('/conf_email', confirmEmail)
router.post('/bind_tg', bindTelegram)
router.post('/send_tg', sendTelegram)

router.get('/products', getProducts)

export default router
