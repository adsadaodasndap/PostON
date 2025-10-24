import { Button } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

const Register = () => {
  return (
    <div>
      <Link to="/app">
        <Button>Войти</Button>
      </Link>
      <Link to="/user">
        <Button>Пользователь</Button>
      </Link>
      <Link to="/admin">
        <Button>Рабочий</Button>
      </Link>
    </div>
  )
}

export default Register
