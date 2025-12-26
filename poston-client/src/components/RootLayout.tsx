import { Outlet, useLocation } from 'react-router-dom'
import { UserProvider } from '../context/user/UserProvider'
import TopBar from './TopBar'

const RootLayout = () => {
  const location = useLocation()
  const hideTopBar =
    location.pathname === '/auth' ||
    location.pathname === '/register' ||
    location.pathname === '/'

  return (
    <UserProvider>
      {hideTopBar ? null : <TopBar />}
      <Outlet />
    </UserProvider>
  )
}

export default RootLayout
