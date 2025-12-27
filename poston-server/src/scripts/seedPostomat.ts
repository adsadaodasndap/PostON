import { Postomat, Slot } from '../db/models'

export const seedPostomatWithSlots = async () => {
  const [p] = await Postomat.findOrCreate({
    where: { id: 1 },
    defaults: {
      adress: 'Постомат №1, Пр.Нурсултана Назарбаева 46, Усть-Каменогорск',
      lat: 49.97,
      lon: 82.61,
    },
  })

  const existing = await Slot.count({ where: { postomat_id: p.id } })
  if (existing >= 20) return

  const toCreate = []
  for (let i = existing; i < 20; i++) {
    toCreate.push({
      postomat_id: p.id,
      width: 400,
      height: 400,
      length: 400,
    })
  }
  await Slot.bulkCreate(toCreate)
}
