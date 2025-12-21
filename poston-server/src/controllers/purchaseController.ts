import { Response } from 'express'
import { Branch, Postomat, Product, Purchase, Slot, User } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'
import bot from '../modules/telegram'
import { Request } from '../types/Request'
import type { DeliveryType, CourierMode } from '../db/models'
import crypto from 'crypto'
import { Op } from 'sequelize'
import type { PurchaseStatus } from '../db/models'

const isDeliveryType = (v: string): v is DeliveryType =>
  v === 'BRANCH' || v === 'POSTOMAT' || v === 'COURIER'

const isCourierMode = (v: string): v is CourierMode =>
  v === 'HOME' || v === 'POSTOMAT'

export const createPurchase = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const {
      productId,
      deliveryType,
      branchId,
      // postomatId,
      courierId,
      courierMode,
    } = req.body

    if (!productId || !deliveryType) {
      return res
        .status(400)
        .json({ message: 'Необходимо указать товар и тип доставки' })
    }

    const product = await Product.findByPk(productId)
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

    const courier_qr = crypto.randomUUID()
    const client_qr = crypto.randomUUID()

    const door_opened = false
    const slot_reserved_until = null
    const slot_reserved_id = null

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
      courier_qr,
      client_qr,
      door_opened,
      slot_reserved_until,
      slot_reserved_id,
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
export const markReceived = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { id } = req.params

    const purchase = await Purchase.findByPk(id)
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
export const courierScanQr = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'authorization_required' })
    }
    if (req.user.role !== 'COURIER') {
      return res.status(403).json({ message: 'forbidden' })
    }

    const { courierQr, postomatId } = req.body

    if (!courierQr || !postomatId) {
      return res.status(400).json({
        message: 'Нужно передать courierQr и postomatId',
      })
    }

    const now = new Date()

    const purchase = await Purchase.findOne({
      where: { courier_qr: String(courierQr) },
      include: [Product],
    })

    if (!purchase) {
      return res.status(404).json({ message: 'Посылка по QR не найдена' })
    }

    if (purchase.delivery_type !== 'COURIER') {
      return res.status(400).json({ message: 'Это не курьерская посылка' })
    }
    if (purchase.courier_mode !== 'POSTOMAT') {
      return res.status(400).json({
        message: 'Эта посылка не предназначена для доставки в постомат',
      })
    }
    if (!purchase.courier_id || purchase.courier_id !== req.user.id) {
      return res.status(403).json({ message: 'Это не ваша посылка' })
    }
    if (purchase.date_receive) {
      return res.status(400).json({ message: 'Посылка уже получена' })
    }

    if (purchase.postomat_slot) {
      return res.status(200).json({
        message: 'Посылка уже размещена в постомате',
        postomat_slot: purchase.postomat_slot,
        postomat_id: purchase.postomat_id,
      })
    }

    const p = purchase.product
    if (!p) {
      return res.status(500).json({ message: 'Не найден товар в заказе' })
    }

    const pid = Number(postomatId)

    const slots = await Slot.findAll({
      where: { postomat_id: pid },
      order: [['id', 'ASC']],
    })

    if (slots.length === 0) {
      return res.status(404).json({ message: 'У постомата нет ячеек' })
    }

    const occupied = await Purchase.findAll({
      where: {
        postomat_id: pid,
        date_receive: null,
      },
      attributes: ['postomat_slot'],
    })

    const occupiedSet = new Set<number>()
    for (const row of occupied) {
      if (row.postomat_slot) occupiedSet.add(row.postomat_slot)
    }

    const reserved = await Purchase.findAll({
      where: {
        postomat_id: pid,
        slot_reserved_until: { [Op.gt]: now },
      },
      attributes: ['slot_reserved_id'],
    })

    const reservedSet = new Set<number>()
    for (const row of reserved) {
      if (row.slot_reserved_id) reservedSet.add(row.slot_reserved_id)
    }

    const available = slots.filter((s) => {
      const sizeOk =
        p.length <= s.length && p.width <= s.width && p.height <= s.height
      if (!sizeOk) return false
      if (occupiedSet.has(s.id)) return false
      if (reservedSet.has(s.id)) return false
      return true
    })

    if (available.length === 0) {
      return res.status(409).json({
        message: 'Нет свободной ячейки подходящего размера',
      })
    }

    const chosen = available[Math.floor(Math.random() * available.length)]

    const until = new Date(now.getTime() + 5 * 60 * 1000)

    await Purchase.update(
      {
        postomat_id: pid,
        slot_reserved_id: chosen.id,
        slot_reserved_until: until,
        door_opened: true,
      },
      { where: { id: purchase.id } }
    )

    return res.json({
      message: 'Ячейка выбрана и зарезервирована',
      postomat_id: pid,
      slot_id: chosen.id,
      reserved_until: until,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
const nowPlusMinutes = (m: number) => new Date(Date.now() + m * 60_000)

const occupiedStatuses: PurchaseStatus[] = [
  'SLOT_RESERVED',
  'DOOR_OPEN',
  'PLACED',
  'DOOR_CLOSED',
  'READY_FOR_PICKUP',
]

export const courierScanAtPostomat = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'authorization_required' })
    }
    if (req.user.role !== 'COURIER') {
      return res.status(403).json({ message: 'forbidden' })
    }

    const { courierQr, postomatId } = req.body

    if (!courierQr || !postomatId) {
      return res
        .status(400)
        .json({ message: 'courierQr и postomatId обязательны' })
    }

    const purchase = await Purchase.findOne({
      where: {
        courier_qr: String(courierQr),
        courier_id: req.user.id,
      },
      include: [Product],
    })

    if (!purchase) {
      return res.status(404).json({ message: 'Заказ по QR не найден' })
    }

    if (
      purchase.delivery_type !== 'COURIER' ||
      purchase.courier_mode !== 'POSTOMAT'
    ) {
      return res
        .status(400)
        .json({ message: 'Этот заказ не предназначен для доставки в постомат' })
    }

    if (
      purchase.status !== 'COURIER_ASSIGNED' &&
      purchase.status !== 'SLOT_RESERVED'
    ) {
      return res.status(400).json({
        message: `Нельзя начать постомат-флоу из статуса ${purchase.status}`,
      })
    }

    const postomat = await Postomat.findByPk(Number(postomatId))
    if (!postomat) {
      return res.status(404).json({ message: 'Постомат не найден' })
    }

    const slots = await Slot.findAll({
      where: { postomat_id: postomat.id },
      order: [['id', 'ASC']],
    })

    if (slots.length === 0) {
      return res.status(409).json({ message: 'У постомата нет ячеек' })
    }

    const busy = await Purchase.findAll({
      where: {
        postomat_id: postomat.id,
        postomat_slot: { [Op.ne]: null },
        date_receive: null,
        status: { [Op.in]: occupiedStatuses },
      },
      attributes: ['postomat_slot'],
    })

    const busySet = new Set<number>(busy.map((p) => Number(p.postomat_slot)))
    const freeSlots = slots.filter((s) => !busySet.has(s.id))

    if (freeSlots.length === 0) {
      return res.status(409).json({ message: 'Нет свободных ячеек' })
    }

    const chosen = freeSlots[Math.floor(Math.random() * freeSlots.length)]

    await purchase.update({
      postomat_id: postomat.id,
      postomat_slot: chosen.id,
      slot_reserved_id: chosen.id,
      slot_reserved_until: nowPlusMinutes(5),
      door_opened: false,
      status: 'SLOT_RESERVED',
    })

    const slotsUi = slots.map((s, index) => ({
      uiIndex: index + 1, // 1..N
      slotId: s.id,
      isBusy: busySet.has(s.id),
      isChosen: s.id === chosen.id,
    }))

    return res.json({
      message: 'Ячейка зарезервирована',
      purchaseId: purchase.id,
      postomat: { id: postomat.id, adress: postomat.adress },
      chosen: { slotId: chosen.id },
      slots: slotsUi,
      reservedUntil: purchase.slot_reserved_until,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierOpenDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    if (req.user.role !== 'COURIER')
      return res.status(403).json({ message: 'forbidden' })

    const { id } = req.params

    const purchase = await Purchase.findByPk(id)
    if (!purchase) return res.status(404).json({ message: 'Заказ не найден' })

    if (purchase.courier_id !== req.user.id) {
      return res.status(403).json({ message: 'forbidden' })
    }

    if (purchase.status !== 'SLOT_RESERVED') {
      return res.status(400).json({
        message: `Дверь можно открыть только из SLOT_RESERVED, сейчас ${purchase.status}`,
      })
    }

    if (
      !purchase.slot_reserved_until ||
      new Date(purchase.slot_reserved_until).getTime() < Date.now()
    ) {
      return res
        .status(409)
        .json({ message: 'Резерв ячейки истёк, пересканируйте QR' })
    }

    await purchase.update({
      door_opened: true,
      status: 'DOOR_OPEN',
    })

    return res.json({ message: 'Дверца открыта', purchaseId: purchase.id })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierPlaceParcel = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    if (req.user.role !== 'COURIER')
      return res.status(403).json({ message: 'forbidden' })

    const { id } = req.params

    const purchase = await Purchase.findByPk(id)
    if (!purchase) return res.status(404).json({ message: 'Заказ не найден' })

    if (purchase.courier_id !== req.user.id) {
      return res.status(403).json({ message: 'forbidden' })
    }

    if (purchase.status !== 'DOOR_OPEN') {
      return res.status(400).json({
        message: `Положить можно только из DOOR_OPEN, сейчас ${purchase.status}`,
      })
    }

    await purchase.update({
      status: 'PLACED',
    })

    return res.json({
      message: 'Посылка отмечена как положенная',
      purchaseId: purchase.id,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierCloseDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    if (req.user.role !== 'COURIER')
      return res.status(403).json({ message: 'forbidden' })

    const { id } = req.params

    const purchase = await Purchase.findByPk(id, {
      include: [{ model: User, as: 'buyer' }],
    })
    if (!purchase) return res.status(404).json({ message: 'Заказ не найден' })

    if (purchase.courier_id !== req.user.id) {
      return res.status(403).json({ message: 'forbidden' })
    }

    if (purchase.status !== 'PLACED') {
      return res.status(400).json({
        message: `Закрыть дверцу можно только из PLACED, сейчас ${purchase.status}`,
      })
    }

    await purchase.update({
      door_opened: false,
      date_send: purchase.date_send ?? new Date(),
      status: 'READY_FOR_PICKUP',
    })

    if (purchase.buyer?.tg_id) {
      await bot.telegram.sendMessage(
        purchase.buyer.tg_id,
        `Посылка #${purchase.id} помещена в постомат. QR для получения готов.`
      )
    }

    return res.json({
      message: 'Дверца закрыта, посылка готова к выдаче',
      purchaseId: purchase.id,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientScanQr = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { clientQr } = req.body
    if (!clientQr)
      return res.status(400).json({ message: 'clientQr обязателен' })

    const purchase = await Purchase.findOne({
      where: {
        client_qr: String(clientQr),
      },
      include: [Postomat, { model: Slot, as: 'slot' }, Product],
    })

    if (!purchase)
      return res.status(404).json({ message: 'Посылка по QR не найдена' })
    if (purchase.user_id !== req.user.id)
      return res.status(403).json({ message: 'forbidden' })

    if (purchase.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({
        message: `Посылка ещё не готова к выдаче. Статус: ${purchase.status}`,
      })
    }

    return res.json({
      message: 'Можно забирать',
      purchaseId: purchase.id,
      postomat: purchase.postomat,
      slot: purchase.slot,
      product: purchase.product,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientPickupParcel = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { id } = req.params
    const purchase = await Purchase.findByPk(id)
    if (!purchase) return res.status(404).json({ message: 'Заказ не найден' })

    if (purchase.user_id !== req.user.id)
      return res.status(403).json({ message: 'forbidden' })

    if (purchase.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({
        message: `Забрать можно только из READY_FOR_PICKUP, сейчас ${purchase.status}`,
      })
    }

    await purchase.update({
      date_receive: new Date(),
      status: 'PICKED_UP',
      slot_reserved_id: null,
      slot_reserved_until: null,
    })

    return res.json({ message: 'Посылка получена', purchaseId: purchase.id })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
