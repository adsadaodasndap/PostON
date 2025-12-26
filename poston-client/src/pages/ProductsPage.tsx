import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
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

type CategoryId = 'pc' | 'furniture'

const categories = [
  { id: 'pc' as const, title: 'Компьютерные комплектующие и переферия' },
  { id: 'furniture' as const, title: 'Мебель' },
]

// public/catalog/*
const imageByName: Record<string, string> = {
  'Процессор Intel Core i5-12400F':
    '/catalog/Процессор Intel Core i5-12400F.jpg',
  'Процессор AMD Ryzen 5 5600': '/catalog/Процессор AMD Ryzen 5 5600.jpg',
  'Видеокарта NVIDIA RTX 3060 12GB':
    '/catalog/Видеокарта NVIDIA RTX 3060 12GB.jpg',
  'Видеокарта AMD Radeon RX 6700 XT':
    '/catalog/Видеокарта AMD Radeon RX 6700 XT.jpg',
}

const fallbackImage = '/catalog/_no-image.jpg'

export default function ProductsPage() {
  const { user, cart, setCart } = useUser()

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<CategoryId>('pc')

  const [newProduct, setNewProduct] = useState({
    name: '',
    cost: 0,
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  })

  const [error, setError] = useState<string | null>(null)

  const isManager = user?.role === 'ADMIN' || user?.role === 'SELLER'
  const isBuyer = user?.role === 'BUYER'

  useEffect(() => {
    getProducts().then((r) => r?.products && setProducts(r.products))
  }, [])

  const filteredProducts = useMemo(() => {
    if (category === 'furniture') return []
    return products
  }, [category, products])

  const handleAddProduct = async () => {
    setError(null)

    if (!newProduct.name || newProduct.cost <= 0) {
      setError('Заполните корректно все поля')
      return
    }

    await createProduct(
      newProduct.name,
      newProduct.cost,
      newProduct.length,
      newProduct.width,
      newProduct.height,
      newProduct.weight
    )

    const r = await getProducts()
    if (r?.products) setProducts(r.products)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* ЛЕВАЯ КОЛОНКА — ТОВАРЫ */}
        <Grid size={9}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Товары
          </Typography>

          {isManager && (
            <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
              <Typography variant="h6">Добавить товар</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={1.5}>
                <TextField
                  label="Название"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
                <TextField
                  label="Цена"
                  type="number"
                  value={newProduct.cost}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      cost: Number(e.target.value),
                    })
                  }
                />

                {error && <Typography color="error">{error}</Typography>}

                <Button variant="contained" onClick={handleAddProduct}>
                  Создать
                </Button>
              </Stack>
            </Paper>
          )}

          <Grid container spacing={2}>
            {filteredProducts.map((p) => {
              const img = imageByName[p.name] ?? fallbackImage
              const inCart = cart.some((c) => c.id === p.id)

              return (
                <Grid size={4} key={p.id}>
                  <Card variant="outlined">
                    <CardMedia
                      component="img"
                      height={160}
                      image={img}
                      sx={{ objectFit: 'contain' }}
                    />
                    <CardContent>
                      <Typography fontWeight={600}>{p.name}</Typography>
                      <Typography>{p.cost.toLocaleString()} ₸</Typography>
                    </CardContent>
                    <CardActions>
                      {isBuyer &&
                        (inCart ? (
                          <Button startIcon={<CheckIcon />} fullWidth>
                            В корзине
                          </Button>
                        ) : (
                          <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            fullWidth
                            onClick={() =>
                              setCart([
                                ...cart,
                                {
                                  id: p.id,
                                  name: p.name,
                                  price: p.cost,
                                  amount: 1,
                                },
                              ])
                            }
                          >
                            Купить
                          </Button>
                        ))}
                      {isManager && (
                        <Button
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => deleteProduct(p.id)}
                        >
                          Удалить
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Grid>

        {/* ПРАВАЯ КОЛОНКА — КАТЕГОРИИ */}
        <Grid size={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 16 }}>
            <Typography variant="h6">Категории</Typography>
            <List>
              {categories.map((c) => (
                <ListItemButton
                  key={c.id}
                  selected={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  <ListItemText primary={c.title} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
