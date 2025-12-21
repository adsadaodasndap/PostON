import { Response } from 'express'
import { Op } from 'sequelize'
import { Purchase, Slot, Postomat } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'
import { Request } from '../types/Request'

const POSTOMAT_ID = 1
const RESERVE_MINUTES = 10

async function buildSlotsState() {
  const slots = await Slot.findAll({
    where: { postomat_id: POSTOMAT_ID },
    order: [['id', 'ASC']],
    attributes: ['id'],
  })

  const active = await Purchase.findAll({
    where: {
      postomat_id: POSTOMAT_ID,
      postomat_slot: { [Op.ne]: null },
      date_receive: null,
    },
    attributes: ['postomat_slot'],
  })

  const busySet = new Set(active.map((p) => p.postomat_slot as number))

  return slots.map((s) => ({
    id: s.id,
    busy: busySet.has(s.id),
  }))
}

function pickRandomFreeSlot(slots: { id: number; busy: boolean }[]) {
  const free = slots.filter((s) => !s.busy)
  if (free.length === 0) return null
  return free[Math.floor(Math.random() * free.length)]
}

export const courierScanQR = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { qr } = req.body
    if (!qr) return res.status(400).json({ message: 'qr_required' })

    const purchase = await Purchase.findOne({
      where: {
        courier_id: req.user.id,
        courier_qr: String(qr),
        date_receive: null,
      },
    })
    if (!purchase)
      return res.status(404).json({ message: 'purchase_not_found' })

    const slots = await buildSlotsState()
    const chosen = pickRandomFreeSlot(slots)
    if (!chosen) return res.status(409).json({ message: 'no_free_slots' })

    await Purchase.update(
      {
        slot_reserved_id: chosen.id,
        slot_reserved_until: new Date(Date.now() + RESERVE_MINUTES * 60_000),
      },
      { where: { id: purchase.id } }
    )

    return res.json({
      postomatId: POSTOMAT_ID,
      purchaseId: purchase.id,
      slots,
      reservedSlotId: chosen.id,
      reservedUntil: new Date(Date.now() + RESERVE_MINUTES * 60_000),
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierOpenDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.courier_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (!purchase.slot_reserved_id || !purchase.slot_reserved_until)
      return res.status(400).json({ message: 'slot_not_reserved' })

    if (new Date(purchase.slot_reserved_until).getTime() < Date.now())
      return res.status(409).json({ message: 'reservation_expired' })

    await Purchase.update({ door_opened: true }, { where: { id: purchase.id } })
    return res.json({
      message: 'door_opened',
      slotId: purchase.slot_reserved_id,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierPlaceParcel = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.courier_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (!purchase.door_opened)
      return res.status(409).json({ message: 'door_not_opened' })
    if (!purchase.slot_reserved_id)
      return res.status(400).json({ message: 'slot_not_reserved' })

    const busy = await Purchase.findOne({
      where: {
        postomat_id: POSTOMAT_ID,
        postomat_slot: purchase.slot_reserved_id,
        date_receive: null,
      },
      attributes: ['id'],
    })
    if (busy) return res.status(409).json({ message: 'slot_busy' })

    await Purchase.update(
      {
        postomat_id: POSTOMAT_ID,
        postomat_slot: purchase.slot_reserved_id,
        date_send: new Date(),
      },
      { where: { id: purchase.id } }
    )

    return res.json({
      message: 'parcel_placed',
      postomatId: POSTOMAT_ID,
      slotId: purchase.slot_reserved_id,
      clientQr: purchase.client_qr,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierCloseDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.courier_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    await Purchase.update(
      { door_opened: false, slot_reserved_id: null, slot_reserved_until: null },
      { where: { id: purchase.id } }
    )

    return res.json({ message: 'door_closed' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientScanQR = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { qr } = req.body
    if (!qr) return res.status(400).json({ message: 'qr_required' })

    const purchase = await Purchase.findOne({
      where: {
        user_id: req.user.id,
        client_qr: String(qr),
        date_receive: null,
      },
    })
    if (!purchase)
      return res.status(404).json({ message: 'purchase_not_found' })
    if (!purchase.postomat_id || !purchase.postomat_slot)
      return res.status(409).json({ message: 'parcel_not_in_postomat_yet' })

    return res.json({
      purchaseId: purchase.id,
      postomatId: purchase.postomat_id,
      slotId: purchase.postomat_slot,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientOpenDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (!purchase.postomat_id || !purchase.postomat_slot)
      return res.status(409).json({ message: 'parcel_not_in_postomat_yet' })

    await Purchase.update({ door_opened: true }, { where: { id: purchase.id } })
    return res.json({ message: 'door_opened', slotId: purchase.postomat_slot })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientTakeParcel = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (!purchase.door_opened)
      return res.status(409).json({ message: 'door_not_opened' })

    await Purchase.update(
      { date_receive: new Date() },
      { where: { id: purchase.id } }
    )
    return res.json({ message: 'parcel_taken' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientCloseDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })
    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    await Purchase.update(
      { door_opened: false },
      { where: { id: purchase.id } }
    )
    return res.json({ message: 'door_closed' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const getPostomatSlots = async (_req: Request, res: Response) => {
  try {
    const postomat = await Postomat.findByPk(POSTOMAT_ID)
    if (!postomat)
      return res.status(404).json({ message: 'postomat_not_found' })

    const slots = await buildSlotsState()
    return res.json({ postomat, slots })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
