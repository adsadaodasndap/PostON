import cron from 'node-cron'
import { Op } from 'sequelize'
import { Purchase, User } from '../db/models'
import bot from '../telegram'

// Ежедневно в 9:00 напоминаем о неполученных заказах
cron.schedule('0 9 * * *', async () => {
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 дня назад
  const overduePurchases = await Purchase.findAll({
    where: {
      date_send: { [Op.not]: null },
      date_receive: null,
      updatedAt: { [Op.lt]: cutoff },
    },
    include: [{ model: User, as: 'buyer' }],
  })
  for (const purchase of overduePurchases) {
    if (purchase.buyer && purchase.buyer.tg_id) {
      const type =
        purchase.delivery_type === 'BRANCH' ? 'отделения связи' : 'постомата'
      await bot.telegram.sendMessage(
        purchase.buyer.tg_id,
        `Напоминание: вы так и не забрали свой заказ #${purchase.id} из ${type}. Пожалуйста, получите его.`
      )
    }
  }
})
