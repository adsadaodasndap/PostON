import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
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
  const { user, cart, setCart } = useUser()
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    cost: 0,
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    const res = await getProducts()
    if (res?.products) setProducts(res.products as Product[])
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = async () => {
    setError(null)

    if (
      !newProduct.name.trim() ||
      newProduct.cost <= 0 ||
      newProduct.length <= 0 ||
      newProduct.width <= 0 ||
      newProduct.height <= 0 ||
      newProduct.weight <= 0
    ) {
      setError('Заполните все поля (значения должны быть больше 0)')
      return
    }

    await createProduct(
      newProduct.name.trim(),
      Number(newProduct.cost),
      Number(newProduct.length),
      Number(newProduct.width),
      Number(newProduct.height),
      Number(newProduct.weight)
    )

    await fetchProducts()

    setNewProduct({
      name: '',
      cost: 0,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    })
  }

  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id)
    await fetchProducts()
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
                setNewProduct({ ...newProduct, cost: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Длина"
              value={newProduct.length}
              onChange={(e) =>
                setNewProduct({ ...newProduct, length: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Ширина"
              value={newProduct.width}
              onChange={(e) =>
                setNewProduct({ ...newProduct, width: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Высота"
              value={newProduct.height}
              onChange={(e) =>
                setNewProduct({ ...newProduct, height: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Вес"
              value={newProduct.weight}
              onChange={(e) =>
                setNewProduct({ ...newProduct, weight: Number(e.target.value) })
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
            <strong>{prod.name}</strong> — {Number(prod.cost)} ₸
            {isBuyer &&
              (cart.find((i) => i.id === prod.id) ? (
                <Button
                  startIcon={<CheckIcon />}
                  variant="outlined"
                  style={{ marginLeft: '10px' }}
                >
                  В корзине!
                </Button>
              ) : (
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  style={{ marginLeft: '10px' }}
                  onClick={() =>
                    setCart((prev) => [
                      ...prev,
                      {
                        id: prod.id,
                        name: prod.name,
                        price: Number(prod.cost), // строго number
                        amount: 1,
                      },
                    ])
                  }
                >
                  Купить
                </Button>
              ))}
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
