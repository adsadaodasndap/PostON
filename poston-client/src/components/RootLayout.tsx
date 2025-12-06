import { Outlet } from 'react-router-dom'
import { UserProvider } from '../context/user/UserProvider'
import TopBar from './TopBar'

const RootLayout = () => (
  <UserProvider>
    <TopBar />
    <Outlet />
  </UserProvider>
)

export default RootLayout
