import { Dialog, DialogActions, DialogTitle } from '@mui/material'
import { useEffect, useState, type JSX } from 'react'
import { useUser } from '../context/user/useUser'
import HomeButton from './HomeButton'

interface IWithAuth {
  c: JSX.Element
  roles: ('BUYER' | 'SELLER' | 'ADMIN' | 'COURIER' | 'POSTAMAT')[]
}

const WithAuth = ({ c, roles }: IWithAuth) => {
  const { user } = useUser()

  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (user.role && roles.includes(user.role)) {
      setAuthorized(true)
    }
  }, [user])

  return authorized ? (
    c
  ) : (
    <Dialog open>
      <DialogTitle>Требуется авторизация</DialogTitle>
      <DialogActions>
        <HomeButton />
      </DialogActions>
    </Dialog>
  )
}

export default WithAuth
