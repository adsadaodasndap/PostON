import { Button } from '@mui/material'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div>
      <Link to="/app">
        <Button>Войти в приложение</Button>
      </Link>
      <Link to="/reg">
        <Button>Нет аккаунта? Зарегестрироваться</Button>
      </Link>
    </div>
  )
}

export default Login
