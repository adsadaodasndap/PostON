import { useEffect, useState } from 'react'
import { useUser } from '../context/user/useUser'
import { createProduct, deleteProduct, getProducts } from '../http/API'

interface Product {
  id: number
  name: string
  cost: number
  length: number
  width: number
  height: number
  weight: number
}

const ProductsPage = () => {
  const { user } = useUser()
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
    const res = await getProducts()
    if (res?.products) setProducts(res.products)
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
    createProduct(
      newProduct.name,
      parseFloat(newProduct.cost),
      parseFloat(newProduct.length),
      parseFloat(newProduct.width),
      parseFloat(newProduct.height),
      parseFloat(newProduct.weight)
    )
    fetchProducts()
    setNewProduct({
      name: '',
      cost: '',
      length: '',
      width: '',
      height: '',
      weight: '',
    })
  }

  const handleDeleteProduct = async (id: number) => {
    deleteProduct(id)
    fetchProducts()
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
