import { Response } from 'express'
import { Op } from 'sequelize'
import crypto from 'crypto'
import { Purchase, Slot, Postomat } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'
import { Request } from '../types/Request'

const POSTOMAT_ID = 1
const RESERVE_MINUTES = 10
const QR_TTL_DAYS = 7

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

function isExpired(expiresAt: Date | null) {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

async function ensureQrToken(purchaseId: number) {
  const purchase = await Purchase.findByPk(purchaseId)
  if (!purchase) return null

  if (purchase.qr_token) return purchase

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + QR_TTL_DAYS * 24 * 60 * 60 * 1000)

  await Purchase.update(
    { qr_token: token, qr_expires_at: expiresAt, qr_used_at: null },
    { where: { id: purchase.id } }
  )

  purchase.qr_token = token
  purchase.qr_expires_at = expiresAt
  purchase.qr_used_at = null
  return purchase
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
        qr_token: String(qr),
        date_receive: null,
      },
    })

    if (!purchase)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (
      purchase.delivery_type !== 'COURIER' ||
      purchase.courier_mode !== 'POSTOMAT'
    ) {
      return res.status(400).json({ message: 'wrong_delivery_mode' })
    }

    if (purchase.qr_used_at) {
      return res.status(410).json({ message: 'qr_already_used' })
    }

    if (isExpired(purchase.qr_expires_at ?? null)) {
      return res.status(410).json({ message: 'qr_expired' })
    }

    const unified = await ensureQrToken(purchase.id)
    if (!unified) return res.status(404).json({ message: 'purchase_not_found' })

    const now = Date.now()
    const reservedValid =
      unified.slot_reserved_id &&
      unified.slot_reserved_until &&
      new Date(unified.slot_reserved_until).getTime() >= now

    const slots = await buildSlotsState()

    if (reservedValid) {
      return res.json({
        postomatId: POSTOMAT_ID,
        purchaseId: unified.id,
        slots,
        reservedSlotId: unified.slot_reserved_id,
        reservedUntil: unified.slot_reserved_until,
        status: unified.status,
        qr: unified.qr_token,
      })
    }

    const chosen = pickRandomFreeSlot(slots)
    if (!chosen) return res.status(409).json({ message: 'no_free_slots' })

    const reservedUntil = new Date(Date.now() + RESERVE_MINUTES * 60_000)

    await Purchase.update(
      {
        slot_reserved_id: chosen.id,
        slot_reserved_until: reservedUntil,
        status: 'SLOT_RESERVED',
      },
      { where: { id: unified.id } }
    )

    return res.json({
      postomatId: POSTOMAT_ID,
      purchaseId: unified.id,
      slots,
      reservedSlotId: chosen.id,
      reservedUntil,
      status: 'SLOT_RESERVED',
      qr: unified.qr_token,
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

    if (
      purchase.delivery_type !== 'COURIER' ||
      purchase.courier_mode !== 'POSTOMAT'
    ) {
      return res.status(400).json({ message: 'wrong_delivery_mode' })
    }

    if (purchase.qr_used_at) {
      return res.status(410).json({ message: 'qr_already_used' })
    }

    if (isExpired(purchase.qr_expires_at ?? null)) {
      return res.status(410).json({ message: 'qr_expired' })
    }

    if (!purchase.slot_reserved_id || !purchase.slot_reserved_until)
      return res.status(400).json({ message: 'slot_not_reserved' })

    if (new Date(purchase.slot_reserved_until).getTime() < Date.now())
      return res.status(409).json({ message: 'reservation_expired' })

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

    const { purchaseId } = req.body
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

    if (purchase.qr_used_at) {
      return res.status(410).json({ message: 'qr_already_used' })
    }

    if (isExpired(purchase.qr_expires_at ?? null)) {
      return res.status(410).json({ message: 'qr_expired' })
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

    const unified = await ensureQrToken(purchase.id)
    if (!unified) return res.status(404).json({ message: 'purchase_not_found' })

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
      qr: unified.qr_token,
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

    const { purchaseId } = req.body
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

    if (purchase.qr_used_at) {
      return res.status(410).json({ message: 'qr_already_used' })
    }

    if (isExpired(purchase.qr_expires_at ?? null)) {
      return res.status(410).json({ message: 'qr_expired' })
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

    const { qr } = req.body
    if (!qr) return res.status(400).json({ message: 'qr_required' })

    const purchase = await Purchase.findOne({
      where: {
        user_id: req.user.id,
        qr_token: String(qr),
        date_receive: null,
      },
    })

    if (!purchase)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (purchase.qr_used_at) {
      return res.status(410).json({ message: 'qr_already_used' })
    }

    if (isExpired(purchase.qr_expires_at ?? null)) {
      return res.status(410).json({ message: 'qr_expired' })
    }

    if (!purchase.postomat_id || !purchase.postomat_slot)
      return res.status(409).json({ message: 'parcel_not_in_postomat_yet' })

    if (purchase.status !== 'READY_FOR_PICKUP') {
      return res.status(409).json({ message: 'not_ready_for_pickup' })
    }

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

    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (purchase.qr_used_at) {
      return res.status(410).json({ message: 'qr_already_used' })
    }

    if (isExpired(purchase.qr_expires_at ?? null)) {
      return res.status(410).json({ message: 'qr_expired' })
    }

    if (!purchase.postomat_id || !purchase.postomat_slot)
      return res.status(409).json({ message: 'parcel_not_in_postomat_yet' })

    if (purchase.status !== 'READY_FOR_PICKUP') {
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

    const { purchaseId } = req.body
    if (!purchaseId)
      return res.status(400).json({ message: 'purchaseId_required' })

    const purchase = await Purchase.findByPk(Number(purchaseId))
    if (!purchase || purchase.user_id !== req.user.id)
      return res.status(404).json({ message: 'purchase_not_found' })

    if (purchase.qr_used_at) {
      return res.status(410).json({ message: 'qr_already_used' })
    }

    if (isExpired(purchase.qr_expires_at ?? null)) {
      return res.status(410).json({ message: 'qr_expired' })
    }

    if (!purchase.door_opened)
      return res.status(409).json({ message: 'door_not_opened' })

    await Purchase.update(
      {
        date_receive: new Date(),
        qr_used_at: new Date(),
        status: 'PICKED_UP',
      },
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

    const { purchaseId } = req.body
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
