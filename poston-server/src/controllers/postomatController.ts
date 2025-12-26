import { Response } from 'express'
import { Op } from 'sequelize'
import { Purchase, Slot, Postomat } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'
import { Request } from '../types/Request'

const POSTOMAT_ID = 1
const RESERVE_MINUTES = 10

type SlotState = {
  id: number
  busy: boolean
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

async function buildSlotsState(): Promise<SlotState[]> {
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

  // postomat_slot в модели: number | null → фильтруем null тип-гардом, чтобы Set<number> не ругался
  const busySet = new Set<number>(
    active.map((p) => p.postomat_slot).filter((v): v is number => isNumber(v))
  )

  return slots.map((s) => ({
    id: s.id,
    busy: busySet.has(s.id),
  }))
}

function pickRandomFreeSlot(slots: SlotState[]): SlotState | null {
  const free = slots.filter((s) => !s.busy)
  if (free.length === 0) return null
  return free[Math.floor(Math.random() * free.length)] ?? null
}

export const courierScanQR = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { qr } = req.body as { qr?: string }
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

    // сценарий "курьер кладет в постомат"
    if (
      purchase.delivery_type !== 'COURIER' ||
      purchase.courier_mode !== 'POSTOMAT'
    ) {
      return res.status(400).json({ message: 'wrong_delivery_mode' })
    }

    const slots = await buildSlotsState()
    const chosen = pickRandomFreeSlot(slots)
    if (!chosen) return res.status(409).json({ message: 'no_free_slots' })

    const reservedUntil = new Date(Date.now() + RESERVE_MINUTES * 60_000)

    await Purchase.update(
      {
        slot_reserved_id: chosen.id,
        slot_reserved_until: reservedUntil,
        status: 'SLOT_RESERVED',
      },
      { where: { id: purchase.id } }
    )

    return res.json({
      postomatId: POSTOMAT_ID,
      purchaseId: purchase.id,
      slots,
      reservedSlotId: chosen.id,
      reservedUntil,
      status: 'SLOT_RESERVED',
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierOpenDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body as { purchaseId?: number }
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.courier_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (
      purchase.delivery_type !== 'COURIER' ||
      purchase.courier_mode !== 'POSTOMAT'
    ) {
      return res.status(400).json({ message: 'wrong_delivery_mode' })
    }

    if (!purchase.slot_reserved_id || !purchase.slot_reserved_until) {
      return res.status(400).json({ message: 'slot_not_reserved' })
    }

    if (new Date(purchase.slot_reserved_until).getTime() < Date.now()) {
      return res.status(409).json({ message: 'reservation_expired' })
    }

    await Purchase.update(
      { door_opened: true, status: 'DOOR_OPEN' },
      { where: { id: purchase.id } }
    )

    return res.json({
      message: 'door_opened',
      slotId: purchase.slot_reserved_id,
      status: 'DOOR_OPEN',
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierPlaceParcel = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body as { purchaseId?: number }
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.courier_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (
      purchase.delivery_type !== 'COURIER' ||
      purchase.courier_mode !== 'POSTOMAT'
    ) {
      return res.status(400).json({ message: 'wrong_delivery_mode' })
    }

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
        date_send: purchase.date_send ?? new Date(),
        status: 'PLACED',
      },
      { where: { id: purchase.id } }
    )

    return res.json({
      message: 'parcel_placed',
      postomatId: POSTOMAT_ID,
      slotId: purchase.slot_reserved_id,
      clientQr: purchase.client_qr,
      status: 'PLACED',
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const courierCloseDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body as { purchaseId?: number }
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.courier_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (
      purchase.delivery_type !== 'COURIER' ||
      purchase.courier_mode !== 'POSTOMAT'
    ) {
      return res.status(400).json({ message: 'wrong_delivery_mode' })
    }

    await Purchase.update(
      {
        door_opened: false,
        slot_reserved_id: null,
        slot_reserved_until: null,
        status: 'READY_FOR_PICKUP',
      },
      { where: { id: purchase.id } }
    )

    return res.json({ message: 'door_closed', status: 'READY_FOR_PICKUP' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientScanQR = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { qr } = req.body as { qr?: string }
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
      status: purchase.status,
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientOpenDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body as { purchaseId?: number }
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (!purchase.postomat_id || !purchase.postomat_slot)
      return res.status(409).json({ message: 'parcel_not_in_postomat_yet' })

    if (
      purchase.status !== 'READY_FOR_PICKUP' &&
      purchase.status !== 'PLACED'
    ) {
      return res.status(409).json({ message: 'not_ready_for_pickup' })
    }

    await Purchase.update(
      { door_opened: true, status: 'DOOR_OPEN' },
      { where: { id: purchase.id } }
    )

    return res.json({
      message: 'door_opened',
      slotId: purchase.postomat_slot,
      status: 'DOOR_OPEN',
    })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientTakeParcel = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body as { purchaseId?: number }
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (!purchase.door_opened)
      return res.status(409).json({ message: 'door_not_opened' })

    await Purchase.update(
      { date_receive: new Date(), status: 'PICKED_UP' },
      { where: { id: purchase.id } }
    )

    return res.json({ message: 'parcel_taken', status: 'PICKED_UP' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const clientCloseDoor = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'authorization_required' })

    const { purchaseId } = req.body as { purchaseId?: number }
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    await Purchase.update(
      {
        door_opened: false,
        ...(purchase.date_receive ? {} : { status: 'READY_FOR_PICKUP' }),
      },
      { where: { id: purchase.id } }
    )

    return res.json({
      message: 'door_closed',
      status: purchase.date_receive ? 'PICKED_UP' : 'READY_FOR_PICKUP',
    })
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
