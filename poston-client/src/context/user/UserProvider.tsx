import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import { verify } from '../../http/API'
import { baseWSURL } from '../../config'
import { UserContext } from './UserContext'

export interface UserData {
  user_id: number
  role: 'ADMIN' | 'SELLER' | 'BUYER' | 'COURIER' | null
  firstName: string
  lastName: string
  email: string
  photoURL: string
  tg_id: string | null
  // expired_password?: boolean
}

const noUser: UserData = {
  user_id: -1,
  role: null,
  firstName: '',
  lastName: '',
  tg_id: '',
  email: '',
  photoURL: '',
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserData>(noUser)
  const [sio, setSIO] = useState<Socket | null>(null)
  const navigate = useNavigate()

  const login = (userData: UserData, token: string) => {
    if (token) {
      setUser(userData)
      localStorage.token = token
    }
  }

  const logout = (manual: boolean = false) => {
    if (manual) {
      if (
        confirm(
          'Вы уверены, что хотите выйти из аккаунта? Несохраненные изменения будут потеряны!'
        )
      ) {
        localStorage.clear()
      } else return
    } else {
      localStorage.removeItem('token')
    }
    setUser(noUser)
    navigate('/')
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      console.log('Notification permission granted!')
    }
  }

  useEffect(() => {
    requestNotificationPermission()
    if (localStorage.token) {
      verify().then((resv) => {
        if (resv) {
          login(resv.user, resv.token)
          const socket = io(baseWSURL, {
            path: '/ws',
            transports: ['websocket'],
            auth: {
              token: resv.token,
            },
          })
          setSIO(socket)
        } else {
          navigate('/signin')
          logout()
        }
      })
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, login, logout, sio, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
