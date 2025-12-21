import { Slot } from './models'

export async function seedSlotsForPostomat(postomat_id: number) {
  const count = await Slot.count({ where: { postomat_id } })
  if (count >= 20) return

  const need = 20 - count
  const items = Array.from({ length: need }, () => ({
    postomat_id,
    width: 40,
    height: 40,
    length: 40,
  }))

  await Slot.bulkCreate(items)
}
