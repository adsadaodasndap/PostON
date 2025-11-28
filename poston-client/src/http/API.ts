import axios from 'axios'
import { toast } from 'react-toastify'
import { baseURL } from '../types/config'

const host = axios.create({
  baseURL,
})

const $host = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${localStorage.token}`,
  },
})

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
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
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
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}
export const googleLogin = async (idToken: string) => {
  try {
    const res = await host.post('auth/google', {
      idToken,
    })

    toast.success(res.data.message)

    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}
export const verify = async () => {
  try {
    const res = await $host.post('user/verify')
    return res.data
  } catch (e: any) {
    console.log(e)
  }
}
export const bindTg = async (tg_id: string) => {
  try {
    const res = await $host.post('user/bind_tg', { tg_id })
    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}

export const sendTg = async (message: string) => {
  try {
    const res = await $host.post('user/send_tg', { message })
    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}

export const getUsers = async (id?: string) => {
  try {
    const res = await $host.get('auth/users', { params: { id } })

    toast.success(res.data.message)

    return res.data
  } catch (e: any) {
    if (e.response?.data?.message) toast.error(e.response.data.message)
    console.log(e)
  }
}
