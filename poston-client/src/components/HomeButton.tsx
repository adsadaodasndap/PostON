import { Home } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { Link } from 'react-router-dom'

const HomeButton = () => {
  return (
    <Link to="/">
      <IconButton>
        <Home />
      </IconButton>
    </Link>
  )
}

export default HomeButton
