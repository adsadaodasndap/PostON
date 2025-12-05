import { Response } from 'express'
import { Op } from 'sequelize'
import { Purchase, Product, User, Branch, Postomat, Slot } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'
import bot from '../modules/telegram'
import { Request } from '../types/Request'

export const createPurchase = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { productId, deliveryType, branchId, postomatId } = req.body
    if (!productId || !deliveryType) {
      return res
        .status(400)
        .json({ message: 'Необходимо указать товар и тип доставки' })
    }
    const product = await Product.findByPk(productId)
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' })
    }
    let branch_id: number | undefined
    let postomat_id: number | undefined
    let slot_id: number | undefined
    let courier_id: number | undefined = undefined
    const dt: string = deliveryType.toUpperCase()
    if (dt === 'BRANCH') {
      if (!branchId) {
        return res
          .status(400)
          .json({ message: 'Необходимо выбрать отделение связи' })
      }
      branch_id = Number(branchId)
    } else if (dt === 'POSTOMAT') {
      if (!postomatId) {
        return res.status(400).json({ message: 'Необходимо выбрать постомат' })
      }
      postomat_id = Number(postomatId)
      const slots = await Slot.findAll({ where: { postomat_id: postomat_id } })
      let foundSlot: Slot | undefined
      for (const slot of slots) {
        const sizeOk =
          product.length <= slot.length &&
          product.width <= slot.width &&
          product.height <= slot.height
        if (!sizeOk) continue
        const activePurchase = await Purchase.findOne({
          where: {
            postomat_slot: slot.id,
            date_receive: { [Op.is]: null },
          },
        })
        if (!activePurchase) {
          foundSlot = slot
          break
        }
      }
      if (!foundSlot) {
        return res.status(409).json({
          message:
            'Нет доступной ячейки подходящего размера в выбранном постомате',
        })
      }
      slot_id = foundSlot.id
    } else if (dt === 'COURIER') {
      courier_id = null
    } else {
      return res.status(400).json({ message: 'Некорректный тип доставки' })
    }
    const newPurchase = await Purchase.create({
      user_id: req.user.id,
      product_id: product.id,
      delivery_type: dt,
      branch_id: branch_id,
      postomat_id: postomat_id,
      postomat_slot: slot_id,
      courier_id: courier_id,
      date_buy: new Date(),
      date_send: dt === 'COURIER' ? null : new Date(),
      date_receive: null,
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
    const purchase = await Purchase.findByPk(id, {
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
    await Purchase.update(
      { courier_id: Number(courierId), date_send: new Date() },
      { where: { id: purchase.id } }
    )
    const updated = await Purchase.findByPk(id, {
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
    const purchase = await Purchase.findByPk(id, {
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
