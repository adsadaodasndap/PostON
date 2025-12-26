import { useEffect, useRef, useState, type ReactNode } from 'react'
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

  const [user, setUser] = useState<UserData>(noUser)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [sio, setSIO] = useState<Socket | null>(null)

  const authVersionRef = useRef(0)

  const loadCart = (): CartItem[] => {
    const raw = localStorage.getItem('cart')
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return []

      return parsed
        .map((it) => {
          const obj = it as Partial<CartItem> & { price?: unknown }

          if (typeof obj.id !== 'number') return null
          if (typeof obj.name !== 'string') return null

          const priceNum = Number(obj.price)
          const price = Number.isFinite(priceNum) ? priceNum : 0

          const amountNum = Number(obj.amount)
          const amount =
            Number.isFinite(amountNum) && amountNum > 0 ? amountNum : 1

          return {
            id: obj.id,
            name: obj.name,
            price,
            amount,
          } satisfies CartItem
        })
        .filter((v): v is CartItem => v !== null)
    } catch {
      return []
    }
  }

  useEffect(() => {
    setCart(loadCart())
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const login = (userData: UserData, token: string) => {
    if (!token) return
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logout = (manual: boolean = false) => {
    const doLogout = () => {
      authVersionRef.current += 1

      try {
        sio?.disconnect()
      } catch (e) {
        console.warn(e)
      }

      localStorage.removeItem('token')
      setUser(noUser)
      setCartOpen(false)
      setSIO(null)
      navigate('/login', { replace: true })
    }

    if (manual) {
      const ok = confirm('Вы уверены, что хотите выйти из аккаунта?')
      if (!ok) return
      localStorage.removeItem('cart')
      doLogout()
      return
    }

    doLogout()
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const startedAtVersion = authVersionRef.current
    let cancelled = false

    verify().then((res) => {
      if (cancelled) return
      if (authVersionRef.current !== startedAtVersion) return

      if (!res?.token) {
        logout(false)
        return
      }

      login(res.user, res.token)

      const socket = io(baseWSURL, {
        path: '/ws',
        transports: ['websocket'],
        auth: { token: res.token },
      })

      setSIO(socket)

      if (res.user.role === 'POSTAMAT') {
        navigate('/postamat', { replace: true })
      }
    })

    return () => {
      cancelled = true
    }
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
