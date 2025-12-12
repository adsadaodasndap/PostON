import sequelize from './db.js'
import {
  AutoIncrement,
  Column,
  PrimaryKey,
  Table,
  Model,
  Unique,
  AllowNull,
  Default,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  HasOne,
} from 'sequelize-typescript'

export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'COURIER' | 'POSTAMAT'

interface UserCreationAttributes {
  name: string
  role?: UserRole
  phone?: string
  password: string
  email: string
  activation_code?: string
  active?: boolean
  is_google?: boolean
}

@Table({ timestamps: true })
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare name: string

  @Default('BUYER')
  @Column(DataType.ENUM('ADMIN', 'SELLER', 'BUYER', 'COURIER', 'POSTAMAT'))
  declare role: UserRole

  @Column(DataType.STRING)
  declare phone: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string

  @Column(DataType.STRING)
  declare activation_code: string

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare active: boolean

  @AllowNull(true)
  @Column(DataType.STRING)
  declare tg_id: string | null

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_google: boolean

  @HasMany(() => Purchase, { foreignKey: 'user_id' })
  declare purchases: Purchase[]

  @HasMany(() => Purchase, { foreignKey: 'courier_id' })
  declare deliveries: Purchase[]
}

interface BranchCreationAttributes {
  post_rating: number
  adress: string
}

@Table({ timestamps: true })
export class Branch extends Model<Branch, BranchCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare post_rating: number

  @AllowNull(false)
  @Column(DataType.STRING(15))
  declare adress: string

  @HasMany(() => Purchase)
  declare purchases: Purchase[]
}

interface PostomatCreationAttributes {
  adress: string
  lat?: number
  lon?: number
}

@Table({ timestamps: true })
export class Postomat extends Model<Postomat, PostomatCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  declare adress: string

  @Column(DataType.DECIMAL(9, 6))
  declare lat: number

  @Column(DataType.DECIMAL(9, 6))
  declare lon: number

  @HasMany(() => Slot)
  declare slots: Slot[]

  @HasMany(() => Purchase)
  declare purchases: Purchase[]
}

interface SlotCreationAttributes {
  postomat_id: number
  width: number
  height: number
  length: number
}

@Table({ timestamps: true })
export class Slot extends Model<Slot, SlotCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @AllowNull(false)
  @ForeignKey(() => Postomat)
  @Column(DataType.INTEGER)
  declare postomat_id: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare width: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare height: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare length: number

  @BelongsTo(() => Postomat)
  declare postomat: Postomat

  @HasMany(() => Purchase, { foreignKey: 'postomat_slot' })
  declare purchases: Purchase[]
}

interface ProductCreationAttributes {
  name: string
  cost: number
  length: number
  width: number
  height: number
  weight: number
}

@Table({ timestamps: true })
export class Product extends Model<Product, ProductCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  declare cost: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare length: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare width: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare height: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare weight: number

  @HasMany(() => Purchase)
  declare purchases: Purchase[]
}

interface ReviewCreationAttributes {
  points_product: number
  points_delivery: number
  content: string
  purchase_id: number
}

@Table({ timestamps: true })
export class Review extends Model<Review, ReviewCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare points_product: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare points_delivery: number

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare content: string

  @AllowNull(false)
  @ForeignKey(() => Purchase)
  @Column(DataType.INTEGER)
  declare purchase_id: number

  @BelongsTo(() => Purchase)
  declare purchase: Purchase
}

export type DeliveryType = 'BRANCH' | 'POSTOMAT' | 'COURIER'

interface PurchaseCreationAttributes {
  user_id: number
  product_id: number
  date_buy?: Date
  date_send?: Date
  date_receive?: Date
  delivery_type: DeliveryType
  branch_id?: number
  postomat_id?: number
  courier_id?: number
  postomat_slot?: number
}

@Table({ timestamps: true })
export class Purchase extends Model<Purchase, PurchaseCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare user_id: number

  @AllowNull(false)
  @ForeignKey(() => Product)
  @Column(DataType.INTEGER)
  declare product_id: number

  @Column(DataType.DATE)
  declare date_buy: Date

  @AllowNull(false)
  @Column(DataType.DATE)
  declare date_send: Date | null

  @AllowNull(false)
  @Column(DataType.DATE)
  declare date_receive: Date | null

  @AllowNull(false)
  @Column(DataType.ENUM('BRANCH', 'POSTOMAT', 'COURIER'))
  declare delivery_type: DeliveryType

  @ForeignKey(() => Branch)
  @Column(DataType.INTEGER)
  declare branch_id: number

  @ForeignKey(() => Postomat)
  @Column(DataType.INTEGER)
  declare postomat_id: number

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare courier_id: number

  @ForeignKey(() => Slot)
  @Column(DataType.INTEGER)
  declare postomat_slot: number

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'buyer' })
  declare buyer: User

  @BelongsTo(() => User, { foreignKey: 'courier_id', as: 'courier' })
  declare courier: User

  @BelongsTo(() => Product)
  declare product: Product

  @BelongsTo(() => Branch)
  declare branch: Branch

  @BelongsTo(() => Postomat)
  declare postomat: Postomat

  @BelongsTo(() => Slot, { foreignKey: 'postomat_slot', as: 'slot' })
  declare slot: Slot

  @HasOne(() => Review)
  declare review: Review
}

sequelize.addModels([User, Branch, Postomat, Slot, Product, Review, Purchase])
