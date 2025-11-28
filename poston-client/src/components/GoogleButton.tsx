import { Google } from '@mui/icons-material'
import { Button } from '@mui/material'
import { googleID } from '../config'
import { useUser } from '../context/user/useUser'
import { googleLogin } from '../http/API'

export default function GoogleLoginButton() {
  const { login } = useUser()

  const handleClick = () => {
    const callbackUrl = `${window.location.origin}/auth/google-callback.html`
    const googleClientId = googleID
    const nonce = Math.random().toString(36).substring(2)
    const targetUrl =
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      `client_id=${googleClientId}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      '&response_type=id_token' +
      '&scope=openid%20email%20profile' +
      `&nonce=${nonce}` +
      '&response_mode=fragment'

    window.open(targetUrl, 'GoogleLogin', 'width=500,height=600')

    const listener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data?.token) return

      window.removeEventListener('message', listener)

      try {
        const idToken = event.data.token
        const res = await googleLogin(idToken)
        login(res.user, res.token)
        // navigate('/1-telegram')
      } catch (err) {
        console.error('Login failed', err)
      }
    }

    window.addEventListener('message', listener)
  }

  return (
    <Button startIcon={<Google />} variant="outlined" onClick={handleClick}>
      Войти через Google
    </Button>
  )
}
