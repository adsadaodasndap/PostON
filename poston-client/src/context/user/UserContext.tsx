import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { UserData } from './UserProvider'
import type { Socket } from 'socket.io-client'
import type { CartItem } from '../../types/CartItem'

export interface UserContextProps {
  user: UserData
  setUser: (newUser: React.SetStateAction<UserData>) => void
  login: (userData: UserData, token: string) => void
  logout: (manual?: boolean) => void
  sio: Socket | null
  cart: CartItem[]
  setCart: Dispatch<SetStateAction<CartItem[]>>

  cartOpen: boolean
  setCartOpen: Dispatch<SetStateAction<boolean>>
}

export const UserContext = createContext<UserContextProps | undefined>(
  undefined
)
