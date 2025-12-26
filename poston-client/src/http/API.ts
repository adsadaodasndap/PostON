import axios, { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { baseURL } from '../config'
const host = axios.create({ baseURL })

export const $host = axios.create({ baseURL })

$host.interceptors.request.use((config) => {
  const token = localStorage.token as string | undefined
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type ApiMessageResponse = {
  message?: string
}

const isApiError = (error: unknown): error is AxiosError<ApiMessageResponse> =>
  axios.isAxiosError(error)

const handleApiError = (error: unknown) => {
  if (isApiError(error)) {
    const msg = error.response?.data?.message
    if (msg) toast.error(msg)
  }
  console.error(error)
}

export type AuthResponse = {
  message?: string
  token: string
  user: {
    id: number
    role: 'ADMIN' | 'SELLER' | 'BUYER' | 'COURIER' | 'POSTAMAT'
    name: string
    email: string
    photoURL: string
    tg_id: string | null
    active?: boolean
  }
}

export const signUp = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string
) => {
  try {
    const res = await host.post('auth/signup', {
      first_name,
      last_name,
      email,
      password,
    })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const res = await host.post<AuthResponse>('auth/signin', {
      email,
      password,
    })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const googleLogin = async (idToken: string) => {
  try {
    const res = await host.post<AuthResponse>('auth/google', { idToken })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const verify = async () => {
  try {
    const res = await $host.post<AuthResponse>('user/verify')
    return res.data
  } catch (error: unknown) {
    console.error(error)
  }
}

export const scanPostamat = async (id: string) => {
  try {
    const res = await $host.post('user/scan', { id })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const bindTg = async (tg_id: string) => {
  try {
    const res = await $host.post('user/bind_tg', { tg_id })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const sendTg = async (message: string) => {
  try {
    const res = await $host.post('user/send_tg', { message })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const sendEmail = async () => {
  try {
    const res = await $host.post('user/email')
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const confirmEmail = async (secret: string) => {
  try {
    const res = await $host.post('user/conf_email', { secret })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const getUsers = async (id?: string) => {
  try {
    const res = await $host.get('auth/users', { params: { id } })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const createAdminUser = async (payload: {
  first_name: string
  last_name: string
  email: string
  role: string
}) => {
  try {
    const res = await $host.post('auth/users', payload)
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export type ProductDTO = {
  id: number
  name: string
  cost: number
  length: number
  width: number
  height: number
  weight: number
}

type ProductsResponseRaw = {
  products: Array<{
    id: number
    name: string
    cost: string | number
    length: number
    width: number
    height: number
    weight: number
  }>
}

export type ProductsResponse = {
  products: ProductDTO[]
}

export const getProducts = async (): Promise<ProductsResponse | undefined> => {
  try {
    const res = await $host.get<ProductsResponseRaw>('auth/products')

    return {
      products: res.data.products.map((p) => ({
        id: p.id,
        name: p.name,
        cost: Number(p.cost),
        length: p.length,
        width: p.width,
        height: p.height,
        weight: p.weight,
      })),
    }
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const createProduct = async (
  name: string,
  cost: number,
  length: number,
  width: number,
  height: number,
  weight: number
) => {
  try {
    const res = await $host.post('user/products', {
      name,
      cost,
      length,
      width,
      height,
      weight,
    })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const deleteProduct = async (id: number) => {
  try {
    const res = await $host.delete('user/products', { params: { id } })
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const askAssistant = async (question: string) => {
  try {
    const res = await $host.post('user/assistant', { question })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export type DeliveryType = 'COURIER' | 'POSTOMAT' | 'BRANCH'
export type CourierMode = 'HOME' | 'POSTOMAT'

export const createPurchase = async (payload: {
  productId: number
  deliveryType: DeliveryType
  branchId?: number
  postomatId?: number
  courierId?: number
  courierMode?: CourierMode
}) => {
  try {
    const res = await $host.post('purchase', payload)
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const getPurchases = async () => {
  try {
    const res = await $host.get('purchase')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const getCouriers = async () => {
  try {
    const res = await $host.get('purchase/couriers')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const receivePurchase = async (id: number) => {
  try {
    const res = await $host.put(`purchase/${id}/receive`)
    toast.success(res.data?.message ?? 'Успешно')
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const postomatCourierEnter = async (qr: string) => {
  try {
    const res = await $host.post('postomat/courier/enter', { qr })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const postomatCourierPlace = async (qr: string) => {
  try {
    const res = await $host.post('postomat/courier/place', { qr })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const postomatCourierClose = async (qr: string) => {
  try {
    const res = await $host.post('postomat/courier/close', { qr })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const postomatClientOpen = async (qr: string) => {
  try {
    const res = await $host.post('postomat/client/open', { qr })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const postomatClientReceive = async (qr: string) => {
  try {
    const res = await $host.post('postomat/client/receive', { qr })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}
