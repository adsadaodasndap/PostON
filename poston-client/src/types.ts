export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'COURIER'

export type DeliveryType = 'BRANCH' | 'POSTOMAT' | 'COURIER'

export type User = {
  id: number
  name: string
  role: UserRole
  phone?: string
  email: string
}

export type Branch = {
  id: number
  adress: string
  post_rating: number
}

export type Postomat = {
  id: number
  adress: string
  lat?: number
  lon?: number
}

export type Slot = {
  id: number
  postomat_id: number
  width: number
  height: number
  length: number
}

export type Product = {
  id: number
  name: string
  cost: number
  length: number
  width: number
  height: number
  weight: number
}

export type Review = {
  id: number
  points_product: number
  points_delivery: number
  content: string
  purchase_id: number
}

export type Purchase = {
  id: number
  user_id: number
  product_id: number
  date_buy?: string
  date_send?: string
  date_receive?: string
  delivery_type: DeliveryType
  branch_id?: number
  postomat_id?: number
  courier_id?: number
  postomat_slot?: number
  buyer?: User
  courier?: User
  product?: Product
  branch?: Branch
  postomat?: Postomat
  slot?: Slot
  review?: Review
}
