import { DataTypes, Model, Sequelize } from 'sequelize'

// Инициализация Sequelize (подставь свои данные)
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost', // адрес сервера базы данных
  dialect: 'postgres', // или 'mysql' / 'sqlite' / 'mariadb'
  logging: false, // отключаем логи
})

// Модель заказа
export class Order extends Model {
  public id!: number
  public userId!: number
  public total!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Order.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, modelName: 'order', tableName: 'orders' }
)

// Модель товара в заказе
export class OrderItem extends Model {
  public id!: number
  public orderId!: number
  public productId!: number
  public name!: string
  public price!: number
  public weight!: string
  public length!: string
  public width!: string
  public height!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

OrderItem.init(
  {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    weight: { type: DataTypes.STRING },
    length: { type: DataTypes.STRING },
    width: { type: DataTypes.STRING },
    height: { type: DataTypes.STRING },
  },
  { sequelize, modelName: 'order_item', tableName: 'order_items' }
)

// Связи
Order.hasMany(OrderItem, { foreignKey: 'orderId' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId' })

// Экспортируем sequelize для синхронизации или использования в других моделях
export default sequelize
