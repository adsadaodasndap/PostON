import axios, { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { baseURL } from '../config'

const host = axios.create({
  baseURL,
})

export const $host = axios.create({ baseURL })

$host.interceptors.request.use((config) => {
  const token = localStorage.token
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
  if (isApiError(error) && error.response?.data?.message) {
    toast.error(error.response.data.message)
  }
  console.error(error)
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
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const res = await host.post('auth/signin', {
      email,
      password,
    })
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const scanPostamat = async (id: string) => {
  try {
    const res = await $host.post('user/scan', { id })
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const googleLogin = async (idToken: string) => {
  try {
    const res = await host.post('auth/google', { idToken })
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const verify = async () => {
  try {
    const res = await $host.post('user/verify')
    return res.data
  } catch (error: unknown) {
    console.error(error)
  }
}

export const bindTg = async (tg_id: string) => {
  try {
    const res = await $host.post('user/bind_tg', { tg_id })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const sendTg = async (message: string) => {
  try {
    const res = await $host.post('user/send_tg', { message })
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const getUsers = async (id?: string) => {
  try {
    const res = await $host.get('auth/users', { params: { id } })
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const sendEmail = async () => {
  try {
    const res = await $host.post('user/email')
    toast.success(res.data.message)
    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}

export const confirmEmail = async (secret: string) => {
  try {
    const res = await $host.post('user/conf_email', { secret })
    toast.success(res.data.message)
    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}

export type ProductDTO = {
  id: number
  name: string
  description: string
  cost: number | string
  image?: string
}

export type ProductsResponse = {
  products: ProductDTO[]
}

export const getProducts = async (): Promise<ProductsResponse | undefined> => {
  try {
    const res = await $host.get<ProductsResponse>('auth/products')

    return {
      products: res.data.products.map((p) => ({
        ...p,
        cost: Number(p.cost), // 🔴 КЛЮЧЕВОЙ ФИКС
      })),
    }
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const deleteProduct = async (id: number) => {
  try {
    const res = await $host.delete('user/products', { params: { id } })
    toast.success(res.data.message)
    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
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
    toast.success(res.data.message)
    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}

export const askAssistant = async (question: string) => {
  try {
    const res = await $host.post('user/assistant', { question })
    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
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
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}
export const createPurchase = async (payload: {
  productId: number
  deliveryType: 'COURIER' | 'POSTOMAT' | 'BRANCH'
  branchId?: number
  postomatId?: number
  courierId?: number
  courierMode?: 'HOME' | 'POSTOMAT'
}) => {
  try {
    const res = await $host.post('purchase', payload)
    toast.success(res.data.message)
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

export const markPurchaseDelivered = async (id: number) => {
  try {
    const res = await $host.put(`purchase/${id}/deliver`)
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}

export const markPurchasePlaced = async (id: number) => {
  try {
    const res = await $host.put(`purchase/${id}/placed`)
    toast.success(res.data.message)
    return res.data
  } catch (error: unknown) {
    handleApiError(error)
  }
}
export const receivePurchase = async (id: number) => {
  try {
    const res = await $host.put(`purchase/${id}/receive`)
    toast.success(res.data.message)
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
