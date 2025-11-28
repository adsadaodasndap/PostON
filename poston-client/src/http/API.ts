import axios, { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { baseURL } from '../config'

const host = axios.create({
  baseURL,
})

const $host = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${localStorage.token}`,
  },
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
