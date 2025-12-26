import { Response } from 'express'
import crypto from 'crypto'
import { Branch, Postomat, Product, Purchase, Slot, User } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'
import bot from '../modules/telegram'
import { Request } from '../types/Request'
import type { CourierMode, DeliveryType } from '../db/models'

const QR_TTL_DAYS = 7

const isDeliveryType = (v: string): v is DeliveryType =>
  v === 'BRANCH' || v === 'POSTOMAT' || v === 'COURIER'

const isCourierMode = (v: string): v is CourierMode =>
  v === 'HOME' || v === 'POSTOMAT'

const makeQrToken = () => crypto.randomUUID()

const makeQrExpiresAt = () =>
  new Date(Date.now() + QR_TTL_DAYS * 24 * 60 * 60 * 1000)

export const createPurchase = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { productId, deliveryType, branchId, courierId, courierMode } =
      req.body

    if (!productId || !deliveryType) {
      return res
        .status(400)
        .json({ message: 'Необходимо указать товар и тип доставки' })
    }

    const product = await Product.findByPk(Number(productId))
    if (!product) return res.status(404).json({ message: 'Товар не найден' })

    let branch_id: number | null = null
    let postomat_id: number | null = null
    let postomat_slot: number | null = null
    let courier_id: number | null = null
    let courier_mode: CourierMode | null = null

    const dtRaw = String(deliveryType).toUpperCase()
    if (!isDeliveryType(dtRaw)) {
      return res.status(400).json({ message: 'Некорректный тип доставки' })
    }
    const dt: DeliveryType = dtRaw

    if (dt === 'BRANCH') {
      if (!branchId) {
        return res
          .status(400)
          .json({ message: 'Необходимо выбрать отделение связи' })
      }
      branch_id = Number(branchId)
      courier_id = null
      courier_mode = null
      postomat_id = null
      postomat_slot = null
    } else if (dt === 'COURIER') {
      if (!courierId) {
        return res.status(400).json({ message: 'Необходимо выбрать курьера' })
      }

      const courier = await User.findByPk(Number(courierId))
      if (!courier || courier.role !== 'COURIER') {
        return res.status(400).json({ message: 'Выбранный курьер не найден' })
      }

      const cmRaw = String(courierMode || 'HOME').toUpperCase()
      if (!isCourierMode(cmRaw)) {
        return res
          .status(400)
          .json({ message: 'Некорректный режим курьерской доставки' })
      }

      courier_id = courier.id
      courier_mode = cmRaw

      branch_id = null
      postomat_id = null
      postomat_slot = null
    } else {
      return res.status(400).json({ message: 'Некорректный тип доставки' })
    }

    const needQr = dt === 'COURIER' && courier_mode === 'POSTOMAT'
    const qr_token = needQr ? makeQrToken() : null
    const qr_expires_at = needQr ? makeQrExpiresAt() : null
    const qr_used_at = null

    const newPurchase = await Purchase.create({
      user_id: req.user.id,
      product_id: product.id,
      delivery_type: dt,

      courier_id,
      branch_id,
      postomat_id,
      postomat_slot,

      courier_mode,

      status: dt === 'COURIER' ? 'COURIER_ASSIGNED' : 'CREATED',

      date_buy: new Date(),
      date_send: dt === 'COURIER' ? null : new Date(),
      date_receive: null,

      qr_token,
      qr_expires_at,
      qr_used_at,

      door_opened: false,
      slot_reserved_until: null,
      slot_reserved_id: null,
    })

    return res.status(201).json({
      message: 'Заказ оформлен',
      purchase: newPurchase,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const getPurchases = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const role = req.user.role
    let purchases: Purchase[]

    if (role === 'ADMIN' || role === 'SELLER') {
      purchases = await Purchase.findAll({
        include: [
          { model: User, as: 'buyer' },
          { model: User, as: 'courier' },
          Product,
          Branch,
          Postomat,
          { model: Slot, as: 'slot' },
        ],
      })
    } else if (role === 'COURIER') {
      purchases = await Purchase.findAll({
        where: { courier_id: req.user.id },
        include: [
          { model: User, as: 'buyer' },
          Product,
          Branch,
          Postomat,
          { model: Slot, as: 'slot' },
        ],
      })
    } else if (role === 'BUYER') {
      purchases = await Purchase.findAll({
        where: { user_id: req.user.id },
        include: [
          Product,
          Branch,
          Postomat,
          { model: Slot, as: 'slot' },
          { model: User, as: 'courier' },
        ],
      })
    } else {
      return res.status(403).json({ message: 'forbidden' })
    }

    return res.json({ purchases })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const assignCourier = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'forbidden' })
    }

    const { id } = req.params
    const { courierId } = req.body

    if (!courierId) {
      return res.status(400).json({ message: 'Необходимо указать курьера' })
    }

    const purchase = await Purchase.findByPk(Number(id), {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'courier' },
      ],
    })

    if (!purchase) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (purchase.delivery_type !== 'COURIER') {
      return res
        .status(400)
        .json({ message: 'Доставка этого заказа не требует курьера' })
    }

    if (purchase.courier_id) {
      return res
        .status(400)
        .json({ message: 'Курьер уже назначен для этого заказа' })
    }

    const courier = await User.findByPk(Number(courierId))
    if (!courier || courier.role !== 'COURIER') {
      return res.status(400).json({ message: 'Выбранный курьер не найден' })
    }

    const needQr = purchase.courier_mode === 'POSTOMAT'
    const patch: Partial<Purchase> = {
      courier_id: courier.id,
      date_send: new Date(),
      status: 'COURIER_ASSIGNED',
    }

    if (needQr) {
      patch.qr_token = purchase.qr_token ?? makeQrToken()
      patch.qr_expires_at = purchase.qr_expires_at ?? makeQrExpiresAt()
      patch.qr_used_at = null
    }

    await Purchase.update(patch, { where: { id: purchase.id } })

    const updated = await Purchase.findByPk(Number(id), {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'courier' },
        Product,
        Branch,
        Postomat,
        { model: Slot, as: 'slot' },
      ],
    })

    if (updated && updated.courier && updated.courier.tg_id) {
      const buyerName = updated.buyer ? updated.buyer.name : 'клиента'
      await bot.telegram.sendMessage(
        updated.courier.tg_id,
        `Вам назначена доставка заказа #${updated.id} для ${buyerName}`
      )
    }

    return res.json({ message: 'Курьер назначен', purchase: updated })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const markDelivered = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { id } = req.params

    const purchase = await Purchase.findByPk(Number(id), {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'courier' },
      ],
    })

    if (!purchase) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (req.user.role === 'COURIER' && purchase.courier_id !== req.user.id) {
      return res.status(403).json({ message: 'forbidden' })
    }

    if (purchase.date_receive) {
      return res
        .status(400)
        .json({ message: 'Заказ уже отмечен как доставленный' })
    }

    await Purchase.update(
      { date_receive: new Date() },
      { where: { id: purchase.id } }
    )

    if (purchase.buyer && purchase.buyer.tg_id) {
      await bot.telegram.sendMessage(
        purchase.buyer.tg_id,
        `Ваш заказ #${purchase.id} доставлен! Спасибо за покупку.`
      )
    }

    return res.json({ message: 'Заказ отмечен доставленным' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const markReceived = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { id } = req.params
    const purchase = await Purchase.findByPk(Number(id))

    if (!purchase) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (purchase.user_id !== req.user.id) {
      return res.status(403).json({ message: 'forbidden' })
    }

    if (purchase.date_receive) {
      return res
        .status(400)
        .json({ message: 'Посылка уже отмечена полученной' })
    }

    await Purchase.update(
      { date_receive: new Date() },
      { where: { id: purchase.id } }
    )

    return res.json({ message: 'Посылка отмечена полученной' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const getCouriers = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const couriers = await User.findAll({
      where: { role: 'COURIER' },
      attributes: ['id', 'name', 'email'],
      order: [['id', 'ASC']],
    })

    return res.json({ couriers })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
