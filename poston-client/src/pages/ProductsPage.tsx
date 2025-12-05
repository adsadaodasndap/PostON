import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

interface Product {
  id: number
  name: string
  cost: number
  length: number
  width: number
  height: number
  weight: number
}

const ProductsPage: React.FC = () => {
  const { user, token } = useContext(AuthContext)
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    cost: '',
    length: '',
    width: '',
    height: '',
    weight: '',
  })
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/products`
      )
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products || [])
      }
    } catch (e) {
      console.error('Failed to fetch products')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = async () => {
    setError(null)
    if (
      !newProduct.name ||
      !newProduct.cost ||
      !newProduct.length ||
      !newProduct.width ||
      !newProduct.height ||
      !newProduct.weight
    ) {
      setError('Заполните все поля для добавления товара')
      return
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newProduct.name,
            cost: parseFloat(newProduct.cost),
            length: parseFloat(newProduct.length),
            width: parseFloat(newProduct.width),
            height: parseFloat(newProduct.height),
            weight: parseFloat(newProduct.weight),
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Ошибка при создании товара')
      }
      setProducts((prev) => [...prev, data.product])
      setNewProduct({
        name: '',
        cost: '',
        length: '',
        width: '',
        height: '',
        weight: '',
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3500'}/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Ошибка при удалении товара')
      }
      setProducts((prev) => prev.filter((prod) => prod.id !== id))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const isManager = user?.role === 'ADMIN' || user?.role === 'SELLER'
  const isBuyer = user?.role === 'BUYER'

  return (
    <div>
      <h2>Товары</h2>
      {isManager && (
        <div style={{ marginBottom: '1rem' }}>
          <h3>Добавить новый товар</h3>
          <div>
            <input
              type="text"
              placeholder="Название"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              placeholder="Цена"
              value={newProduct.cost}
              onChange={(e) =>
                setNewProduct({ ...newProduct, cost: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Длина"
              value={newProduct.length}
              onChange={(e) =>
                setNewProduct({ ...newProduct, length: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Ширина"
              value={newProduct.width}
              onChange={(e) =>
                setNewProduct({ ...newProduct, width: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Высота"
              value={newProduct.height}
              onChange={(e) =>
                setNewProduct({ ...newProduct, height: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Вес"
              value={newProduct.weight}
              onChange={(e) =>
                setNewProduct({ ...newProduct, weight: e.target.value })
              }
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleAddProduct}>Создать товар</button>
        </div>
      )}
      <ul>
        {products.map((prod) => (
          <li key={prod.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{prod.name}</strong> — {prod.cost} ₸
            {isBuyer && (
              <button
                style={{ marginLeft: '10px' }}
                onClick={() =>
                  (window.location.href = `/orders?buy=${prod.id}`)
                }
              >
                Купить
              </button>
            )}
            {isManager && (
              <button
                style={{ marginLeft: '10px' }}
                onClick={() => handleDeleteProduct(prod.id)}
              >
                Удалить
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProductsPage
