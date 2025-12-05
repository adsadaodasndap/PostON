import { Telegraf } from 'telegraf'
import cfg from '../../config'

const bot = new Telegraf(cfg.TG_KEY)
bot.start((ctx) =>
  ctx.reply(`Добро пожаловать! Ваш Telegram ID: ${ctx.from.id}`)
)
bot.command('id', (ctx) => ctx.reply(`Ваш Telegram ID: ${ctx.from.id}`))

export default bot
