import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import NavBar from './components/NavBar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import AssistantPage from './pages/AssistantPage'

const App: React.FC = () => {
  const { user } = useContext(AuthContext)

  return (
    <div>
      <NavBar />
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                // Если пользователь залогинен, перенаправляем на соответствующую страницу
                user.role === 'ADMIN' || user.role === 'SELLER' ? (
                  <Navigate to="/orders" replace />
                ) : user.role === 'COURIER' ? (
                  <Navigate to="/orders" replace />
                ) : (
                  <Navigate to="/products" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <RegisterPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/products"
            element={user ? <ProductsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders"
            element={user ? <OrdersPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/assistant"
            element={
              user ? <AssistantPage /> : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
