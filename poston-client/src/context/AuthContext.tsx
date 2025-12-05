import React, { createContext, useState, useEffect } from 'react'

interface UserData {
  id: number
  name: string
  email: string
  role: string
  active: boolean
  tg_id?: string
  is_google?: boolean
}

interface AuthContextType {
  user: UserData | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  register: (
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ) => Promise<any>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/user/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${savedToken}`,
          },
        }
      )
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (data.user && data.token) {
            setUser(data.user)
            setToken(data.token)
            localStorage.setItem('token', data.token)
          } else {
            localStorage.removeItem('token')
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/auth/signin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Ошибка входа')
      }
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const register = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ first_name, last_name, email, password }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Ошибка регистрации')
      }
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
