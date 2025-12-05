import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

interface Order {
  id: number
  product: { name: string; cost: number }
  buyer?: { name: string; email: string }
  courier?: { name: string; email: string }
  branch?: { adress: string }
  postomat?: { adress: string }
  slot?: { id: number }
  delivery_type: string
  date_buy: string
  date_send: string | null
  date_receive: string | null
  courier_id?: number | null
}

const OrdersPage: React.FC = () => {
  const { user, token } = useContext(AuthContext)
  const [orders, setOrders] = useState<Order[]>([])
  const [couriers, setCouriers] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/purchases`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await res.json()
    if (res.ok) {
      setOrders(data.purchases || [])
    }
  }

  useEffect(() => {
    if (!user) return
    if (user.role === 'ADMIN' || user.role === 'SELLER') {
      fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/auth/users?role=COURIER`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.users) {
            setCouriers(
              data.users.map((u: any) => ({ id: u.id, name: u.name }))
            )
          }
        })
        .catch(console.error)
    }
    fetchOrders().finally(() => setLoading(false))
  }, [user])

  const handleAssignCourier = async (orderId: number, courierId: number) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/purchases/${orderId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courierId }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Ошибка назначения курьера')
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.purchase : o))
      )
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleMarkDelivered = async (orderId: number) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/purchases/${orderId}/deliver`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await res.json()
      if (!res.ok)
        throw new Error(data.message || 'Ошибка при обновлении статуса')
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, date_receive: new Date().toISOString() }
            : o
        )
      )
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) {
    return <p>Загрузка...</p>
  }

  if (!orders.length) {
    return <p>Заказов нет.</p>
  }

  return (
    <div>
      <h2>
        {user?.role === 'BUYER'
          ? 'Мои заказы'
          : user?.role === 'COURIER'
            ? 'Мои доставки'
            : 'Все заказы'}
      </h2>
      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Товар</th>
            {user?.role !== 'BUYER' && <th>Покупатель</th>}
            <th>Доставка</th>
            <th>Статус</th>
            {user?.role === 'ADMIN' && <th>Действия</th>}
            {user?.role === 'COURIER' && <th>Действие</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const delivered = !!order.date_receive
            let status = ''
            if (delivered) {
              status = 'Доставлен'
            } else if (order.delivery_type === 'COURIER') {
              status = order.courier_id
                ? 'В процессе (курьер: ' + order.courier?.name + ')'
                : 'Ожидает курьера'
            } else if (
              order.delivery_type === 'BRANCH' ||
              order.delivery_type === 'POSTOMAT'
            ) {
              status = order.date_send
                ? 'Ожидает получателя'
                : 'Готовится к отправке'
            }
            return (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.product.name}</td>
                {user?.role !== 'BUYER' && (
                  <td>{order.buyer ? order.buyer.name : '-'}</td>
                )}
                <td>
                  {order.delivery_type === 'BRANCH' && (
                    <>В отделение: {order.branch?.adress}</>
                  )}
                  {order.delivery_type === 'POSTOMAT' && (
                    <>
                      В постомат: {order.postomat?.adress}{' '}
                      {order.slot && `(ячейка №${order.slot.id})`}
                    </>
                  )}
                  {order.delivery_type === 'COURIER' && (
                    <>
                      Курьером{' '}
                      {order.courier
                        ? `(назначен: ${order.courier.name})`
                        : '(не назначен)'}
                    </>
                  )}
                </td>
                <td>{status}</td>
                {user?.role === 'ADMIN' && (
                  <td>
                    {!delivered &&
                      order.delivery_type === 'COURIER' &&
                      !order.courier_id && (
                        <>
                          <select
                            onChange={(e) =>
                              handleAssignCourier(
                                order.id,
                                Number(e.target.value)
                              )
                            }
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Выбрать курьера
                            </option>
                            {couriers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    {!delivered && (
                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        style={{ marginLeft: '5px' }}
                      >
                        Отметить доставленным
                      </button>
                    )}
                    {delivered && <span>✓</span>}
                  </td>
                )}
                {user?.role === 'COURIER' && (
                  <td>
                    {!delivered ? (
                      <button onClick={() => handleMarkDelivered(order.id)}>
                        Доставлено
                      </button>
                    ) : (
                      '✓'
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersPage
