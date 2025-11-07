import { Sequelize } from 'sequelize-typescript'
import cfg from '../config.js'

export default new Sequelize(cfg.DB_NAME, cfg.DB_USER, cfg.DB_PASSWORD, {
  dialect: 'postgres',
  host: cfg.DB_HOST,
  port: cfg.DB_PORT,
})
