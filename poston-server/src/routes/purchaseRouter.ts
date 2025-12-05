import { Router } from 'express'
import {
  createPurchase,
  getPurchases,
  assignCourier,
  markDelivered,
} from '../controllers/purchaseController'
import accessLevel from '../middleware/accessLevel'

const router = Router()
// Получение списка заказов (различается по роли)
router.get('/', getPurchases)
// Создание заказа - только покупатель
router.post('/', accessLevel(['BUYER']), createPurchase)
// Назначение курьера - только администратор
router.put('/:id/assign', accessLevel(['ADMIN']), assignCourier)
// Отметить доставленным - админ или курьер (курьер только свой)
router.put('/:id/deliver', accessLevel(['ADMIN', 'COURIER']), markDelivered)

export default router
