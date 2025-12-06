import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '../context/user/useUser'

const NavBar = () => {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      {user ? (
        <>
          <NavLink to="/products" style={{ marginRight: '15px' }}>
            Товары
          </NavLink>
          <NavLink to="/orders" style={{ marginRight: '15px' }}>
            {user.role === 'BUYER'
              ? 'Мои заказы'
              : user.role === 'COURIER'
                ? 'Мои доставки'
                : 'Заказы'}
          </NavLink>
          <NavLink to="/profile" style={{ marginRight: '15px' }}>
            Профиль
          </NavLink>
          <NavLink to="/assistant" style={{ marginRight: '15px' }}>
            Ассистент
          </NavLink>
          <button onClick={handleLogout}>Выйти</button>
        </>
      ) : (
        <>
          <NavLink to="/login" style={{ marginRight: '15px' }}>
            Вход
          </NavLink>
          <NavLink to="/register">Регистрация</NavLink>
        </>
      )}
    </nav>
  )
}

export default NavBar
