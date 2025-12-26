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

const categories: { id: CategoryId; title: string }[] = [
  { id: 'pc', title: 'Компьютерные комплектующие и переферия' },
  { id: 'furniture', title: 'Мебель' },
]

// Vite: подхватываем ВСЕ jpg из src/assets/catalog
const catalogImages = import.meta.glob('../assets/catalog/*.jpg', {
  eager: true,
  as: 'url',
}) as Record<string, string>

const FALLBACK_KEY = '../assets/catalog/_no-image.jpg'

function getCatalogImageUrl(productName: string): string {
  const key = `../assets/catalog/${productName}.jpg`
  return catalogImages[key] ?? catalogImages[FALLBACK_KEY] ?? ''
}

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
    getProducts().then((res) => {
      if (res?.products) setProducts(res.products as Product[])
    })
  }, [])

  const filteredProducts = useMemo(() => {
    // По твоему ТЗ: мебель пока пустая
    if (category === 'furniture') return []
    return products
  }, [category, products])

  const handleAddProduct = async () => {
    setError(null)

    const name = newProduct.name.trim()
    if (
      !name ||
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
      name,
      Number(newProduct.cost),
      Number(newProduct.length),
      Number(newProduct.width),
      Number(newProduct.height),
      Number(newProduct.weight)
    )

    const res = await getProducts()
    if (res?.products) setProducts(res.products as Product[])
  }

  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id)
    const res = await getProducts()
    if (res?.products) setProducts(res.products as Product[])
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* ЛЕВАЯ КОЛОНКА: ТОВАРЫ */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Товары
          </Typography>

          {isManager && (
            <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
              <Typography variant="h6">Добавить товар</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={1.5} sx={{ maxWidth: 520 }}>
                <TextField
                  label="Название"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, name: e.target.value }))
                  }
                  fullWidth
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Цена"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={newProduct.cost}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        cost: Number(e.target.value),
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Вес"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={newProduct.weight}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        weight: Number(e.target.value),
                      }))
                    }
                    fullWidth
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Длина"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={newProduct.length}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        length: Number(e.target.value),
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Ширина"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={newProduct.width}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        width: Number(e.target.value),
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="Высота"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={newProduct.height}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        height: Number(e.target.value),
                      }))
                    }
                    fullWidth
                  />
                </Stack>

                {error && <Typography color="error">{error}</Typography>}

                <Button variant="contained" onClick={handleAddProduct}>
                  Создать товар
                </Button>
              </Stack>
            </Paper>
          )}

          {category === 'furniture' ? (
            <Typography color="text.secondary">
              В категории «Мебель» пока нет товаров.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map((p) => {
                const img = getCatalogImageUrl(p.name)
                const inCart = cart.some((c) => c.id === p.id)

                return (
                  <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardMedia
                        component="img"
                        height={160}
                        image={img}
                        alt={p.name}
                        onError={(e) => {
                          const el = e.currentTarget
                          const fallback = catalogImages[FALLBACK_KEY] ?? ''
                          if (fallback && el.src !== fallback) el.src = fallback
                        }}
                        sx={{
                          objectFit: 'contain',
                          bgcolor: 'background.default',
                        }}
                      />

                      <CardContent>
                        <Typography fontWeight={700}>{p.name}</Typography>
                        <Typography color="text.secondary">
                          {Number(p.cost).toLocaleString()} ₸
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 2 }}>
                        {isBuyer &&
                          (inCart ? (
                            <Button
                              startIcon={<CheckIcon />}
                              variant="outlined"
                              fullWidth
                            >
                              В корзине!
                            </Button>
                          ) : (
                            <Button
                              startIcon={<AddIcon />}
                              variant="contained"
                              fullWidth
                              onClick={() =>
                                setCart((prev) => [
                                  ...prev,
                                  {
                                    id: p.id,
                                    name: p.name,
                                    price: Number(p.cost),
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
                            startIcon={<DeleteOutlineIcon />}
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={() => handleDeleteProduct(p.id)}
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
          )}
        </Grid>

        {/* ПРАВАЯ КОЛОНКА: КАТЕГОРИИ */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, position: 'sticky', top: 16 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Категории
            </Typography>

            <List disablePadding>
              {categories.map((c) => (
                <ListItemButton
                  key={c.id}
                  selected={category === c.id}
                  onClick={() => setCategory(c.id)}
                  sx={{ borderRadius: 1 }}
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
