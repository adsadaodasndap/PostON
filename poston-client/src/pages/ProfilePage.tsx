import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { bindTg, confirmEmail, sendEmail, sendTg } from '../http/API'

const ProfilePage: React.FC = () => {
  const { user, logout } = useContext(AuthContext)
  const [code, setCode] = useState('')
  const [tgId, setTgId] = useState('')

  if (!user) return null

  const handleSendEmail = () => {
    sendEmail()
  }

  const handleConfirmEmail = () => {
    confirmEmail(code)
  }

  const handleBindTelegram = () => {
    bindTg(tgId)
  }

  const handleSendTestMessage = () => {
    sendTg('Тестовое сообщение')
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
      {/* {statusMsg && <p style={{ color: 'green' }}>{statusMsg}</p>} */}
      <button onClick={() => logout()}>Выйти из аккаунта</button>
    </div>
  )
}

export default ProfilePage
