import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import { verify } from '../../http/API'
import { baseWSURL } from '../../config'
import { UserContext } from './UserContext'
import type { CartItem } from '../../types/CartItem'

export interface UserData {
  id: number
  role: 'ADMIN' | 'SELLER' | 'BUYER' | 'COURIER' | 'POSTAMAT' | null
  name: string
  email: string
  photoURL: string
  tg_id: string | null
  active?: boolean
}

const noUser: UserData = {
  id: -1,
  role: null,
  name: '',
  tg_id: '',
  email: '',
  photoURL: '',
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const navigate = useNavigate()

  const loadCart = (): CartItem[] => {
    const c = localStorage.cart
    if (!c) return []

    try {
      const parsed = JSON.parse(c) as unknown
      if (!Array.isArray(parsed)) return []

      return parsed
        .map((it) => {
          const obj = it as Partial<CartItem>

          if (typeof obj.id !== 'number') return null
          if (typeof obj.name !== 'string') return null

          const rawPrice = (obj as { price?: unknown }).price
          const price = Number(rawPrice)
          const amount =
            typeof obj.amount === 'number' && obj.amount > 0 ? obj.amount : 1

          return {
            id: obj.id,
            name: obj.name,
            price: Number.isFinite(price) ? price : 0,
            amount,
          }
        })
        .filter((v): v is CartItem => v !== null)
    } catch {
      return []
    }
  }

  const [user, setUser] = useState<UserData>(noUser)
  const [cart, setCart] = useState<CartItem[]>(loadCart())
  const [cartOpen, setCartOpen] = useState(false)
  const [sio, setSIO] = useState<Socket | null>(null)

  const login = (userData: UserData, token: string) => {
    if (!token) return
    setUser(userData)
    localStorage.token = token
  }

  useEffect(() => {
    localStorage.cart = JSON.stringify(cart)
  }, [cart])

  const logout = (manual: boolean = false) => {
    if (manual) {
      const ok = confirm(
        'Вы уверены, что хотите выйти из аккаунта? Несохраненные изменения будут потеряны!'
      )
      if (!ok) return
      localStorage.clear()
    } else {
      localStorage.removeItem('token')
    }

    if (sio) {
      sio.removeAllListeners()
      sio.disconnect()
      setSIO(null)
    }

    setUser(noUser)
    setCart([])
    setCartOpen(false)

    navigate('/auth', { replace: true })
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return
    try {
      await Notification.requestPermission()
    } catch {
      return
    }
  }

  useEffect(() => {
    requestNotificationPermission()

    const token = localStorage.token
    if (!token) {
      navigate('/auth', { replace: true })
      return
    }

    verify().then((resv) => {
      if (!resv?.token || !resv?.user) {
        logout(false)
        return
      }

      login(resv.user, resv.token)

      const socket = io(baseWSURL, {
        path: '/ws',
        transports: ['websocket'],
        auth: { token: resv.token },
      })

      setSIO(socket)

      if (resv.user.role === 'POSTAMAT') {
        navigate('/postamat', { replace: true })
        return
      }

      navigate('/products', { replace: true })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        sio,
        setUser,
        cart,
        setCart,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
