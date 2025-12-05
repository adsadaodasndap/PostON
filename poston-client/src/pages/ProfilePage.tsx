import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

const ProfilePage: React.FC = () => {
  const { user, token, logout } = useContext(AuthContext)
  const [code, setCode] = useState('')
  const [tgId, setTgId] = useState('')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  if (!user) return null

  const handleSendEmail = async () => {
    setStatusMsg(null)
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/user/email`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await res.json()
      if (res.ok) {
        setStatusMsg(data.message)
      } else {
        throw new Error(data.message)
      }
    } catch (e: any) {
      setStatusMsg(e.message)
    }
  }

  const handleConfirmEmail = async () => {
    setStatusMsg(null)
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/user/conf_email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ secret: code }),
        }
      )
      const data = await res.json()
      if (res.ok) {
        setStatusMsg(data.message)
      } else {
        throw new Error(data.message)
      }
    } catch (e: any) {
      setStatusMsg(e.message)
    }
  }

  const handleBindTelegram = async () => {
    setStatusMsg(null)
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/user/bind_tg`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tg_id: tgId }),
        }
      )
      const data = await res.json()
      if (res.ok) {
        setStatusMsg(data.message)
      } else {
        throw new Error(data.message)
      }
    } catch (e: any) {
      setStatusMsg(e.message)
    }
  }

  const handleSendTestMessage = async () => {
    setStatusMsg(null)
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/user/send_tg`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: 'Тестовое сообщение' }),
        }
      )
      const data = await res.json()
      if (res.ok) {
        setStatusMsg('Тестовое сообщение отправлено в Telegram')
      } else {
        throw new Error(data.message)
      }
    } catch (e: any) {
      setStatusMsg(e.message)
    }
  }

  return (
    <div>
      <h2>Профиль</h2>
      <p>
        <strong>Имя:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}{' '}
        {user.active ? '✓ подтвержден' : ' (не подтвержден)'}{' '}
      </p>
      <p>
        <strong>Роль:</strong> {user.role}
      </p>
      {!user.active && (
        <div style={{ margin: '1rem 0' }}>
          <button onClick={handleSendEmail}>
            Отправить письмо с кодом подтверждения
          </button>
          <div style={{ marginTop: '5px' }}>
            <input
              type="text"
              placeholder="Код из письма"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={handleConfirmEmail} style={{ marginLeft: '5px' }}>
              Подтвердить почту
            </button>
          </div>
        </div>
      )}
      <div style={{ margin: '1rem 0' }}>
        <p>
          Telegram:{' '}
          {user.tg_id ? `привязан (ID: ${user.tg_id})` : 'не привязан'}
        </p>
        {!user.tg_id && (
          <div>
            <input
              type="text"
              placeholder="Ваш Telegram ID"
              value={tgId}
              onChange={(e) => setTgId(e.target.value)}
            />
            <button onClick={handleBindTelegram} style={{ marginLeft: '5px' }}>
              Привязать
            </button>
            <p style={{ fontSize: '0.9em', color: '#555' }}>
              Получить свой Telegram ID: /start в боте
            </p>
          </div>
        )}
        {user.tg_id && (
          <button onClick={handleSendTestMessage}>
            Отправить тестовое сообщение в Telegram
          </button>
        )}
      </div>
      {statusMsg && <p style={{ color: 'green' }}>{statusMsg}</p>}
      <button onClick={() => logout()}>Выйти из аккаунта</button>
    </div>
  )
}

export default ProfilePage
