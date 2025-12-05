import { Telegraf } from 'telegraf'
import cfg from '../../config.js'

const bot = new Telegraf(cfg.TG_KEY)
export default bot
