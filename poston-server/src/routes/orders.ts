import { Router } from 'express'
import { Order, OrderItem } from '../models/order' // твои готовые модели
import accessLevel from '../middleware/accessLevel' // твой middleware авторизации

// Тип для элемента корзины
interface CartItem {
  id: number
  name: string
  cost: number
  weight: string
  length: string
  width: string
  height: string
}

// Расширенный тип запроса с user и body
interface AuthRequest<T = unknown> extends Express.Request {
  user?: { id: number; role: string }
  body: T
}

const router = Router()

// POST /api/orders — создание заказа
router.post(
  '/',
  accessLevel(['BUYER', 'SELLER', 'ADMIN']),
  async (req: AuthRequest<{ items: CartItem[] }>, res) => {
    try {
      const userId = req.user!.id
      const { items } = req.body // массив товаров из корзины

      if (!items || !items.length) {
        return res.status(400).json({ message: 'Корзина пуста' })
      }

      // Итоговая сумма
      const total = items.reduce(
        (sum: number, i: CartItem) => sum + Number(i.cost),
        0
      )

      // Создаём заказ
      const order = await Order.create({ userId, total })

      // Создаём товары в заказе
      const orderItems = items.map((i: CartItem) => ({
        orderId: order.id,
        productId: i.id,
        name: i.name,
        price: Number(i.cost),
        weight: i.weight,
        length: i.length,
        width: i.width,
        height: i.height,
      }))

      await OrderItem.bulkCreate(orderItems)

      res
        .status(201)
        .json({ orderId: order.id, message: 'Заказ успешно создан' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Ошибка сервера' })
    }
  }
)

export default router
