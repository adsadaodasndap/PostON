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

const categories: { id: CategoryId; title: string; icon?: string }[] = [
  {
    id: 'pc',
    title: 'Компьютерные комплектующие и переферия',
    icon: '/icons/pc.svg',
  },
  { id: 'furniture', title: 'Мебель', icon: '/icons/furniture.svg' },
]

// Фото товаров должны лежать в: public/catalog/
// ВАЖНО: ключи должны 1-в-1 совпадать с prod.name из БД

const imageByName: Record<string, string> = {
  // CPU
  'Процессор Intel Core i5-12400F':
    '/catalog/Процессор Intel Core i5-12400F.jpg',
  'Процессор AMD Ryzen 5 5600': '/catalog/Процессор AMD Ryzen 5 5600.jpg',

  // GPU
  'Видеокарта NVIDIA RTX 3060 12GB':
    '/catalog/Видеокарта NVIDIA RTX 3060 12GB.jpg',
  'Видеокарта AMD Radeon RX 6700 XT':
    '/catalog/Видеокарта AMD Radeon RX 6700 XT.jpg',

  // Motherboards
  'Материнская плата ASUS PRIME B660M':
    '/catalog/Материнская плата ASUS PRIME B660M.jpg',
  'Материнская плата MSI B550-A PRO':
    '/catalog/Материнская плата MSI B550-A PRO.jpg',

  // RAM
  'Оперативная память DDR4 16GB (2x8) 3200MHz':
    '/catalog/Оперативная память DDR4 16GB (2x8) 3200MHz.jpg',
  'Оперативная память DDR5 32GB (2x16) 5600MHz':
    '/catalog/Оперативная память DDR5 32GB (2x16) 5600MHz.jpg',

  // Storage
  'SSD NVMe 1TB Samsung 980': '/catalog/SSD NVMe 1TB Samsung 980.jpg',
  'SSD SATA 512GB Kingston A400': '/catalog/SSD SATA 512GB Kingston A400.jpg',
  'Жёсткий диск HDD 2TB Seagate Barracuda':
    '/catalog/Жёсткий диск HDD 2TB Seagate Barracuda.jpg',

  // PSU
  'Блок питания 650W Corsair RM650':
    '/catalog/Блок питания 650W Corsair RM650.jpg',
  'Блок питания 750W Cooler Master MWE':
    '/catalog/Блок питания 750W Cooler Master MWE.jpg',

  // Cooling
  'Кулер для процессора Cooler Master Hyper 212':
    '/catalog/Кулер для процессора Cooler Master Hyper 212.jpg',
  'Вентилятор 120mm Arctic P12': '/catalog/Вентилятор 120mm Arctic P12.jpg',
  'Водяное охлаждение 240mm Deepcool GAMMAXX':
    '/catalog/Водяное охлаждение 240mm Deepcool GAMMAXX.jpg',

  // Case
  'Корпус ATX NZXT H510': '/catalog/Корпус ATX NZXT H510.jpg',
  'Корпус Micro-ATX Deepcool Matrexx 40':
    '/catalog/Корпус Micro-ATX Deepcool Matrexx 40.jpg',

  // Paste
  'Термопаста Arctic MX-4 (4 г)': '/catalog/Термопаста Arctic MX-4 (4 г).jpg',

  // Sound / Periphery
  'Звуковая карта PCI-E Creative Sound Blaster':
    '/catalog/Звуковая карта PCI-E Creative Sound Blaster.jpg',
  'Клавиатура механическая Red Switch':
    '/catalog/Клавиатура механическая Red Switch.jpg',
  'Мышь игровая 16000 DPI': '/catalog/Мышь игровая 16000 DPI.jpg',
  'Ковёр для мыши XL': '/catalog/Ковёр для мыши XL.jpg',

  // Monitor
  'Монитор 24 IPS 144Hz': '/catalog/Монитор 24 IPS 144Hz.jpg',

  // Wi-Fi
  'Wi-Fi адаптер USB AC1300': '/catalog/Wi-Fi адаптер USB AC1300.jpg',
}

// Если нет совпадения по имени — покажем заглушку
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
  const [creating, setCreating] = useState(false)

  const isManager = user?.role === 'ADMIN' || user?.role === 'SELLER'
  const isBuyer = user?.role === 'BUYER'

  const fetchProducts = async () => {
    const res = await getProducts()
    if (res?.products) setProducts(res.products as Product[])
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // По твоему требованию: мебель пока пустая, все существующие товары -> pc
  const filteredProducts = useMemo(() => {
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

    try {
      setCreating(true)
      await createProduct(
        name,
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
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id)
    await fetchProducts()
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
        {/* ЛЕВАЯ КОЛОНКА: ТОВАРЫ */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Товары
          </Typography>

          {isManager && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Добавить новый товар
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5} sx={{ maxWidth: 560 }}>
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
                    inputProps={{ step: 0.01, min: 0 }}
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
                    inputProps={{ step: 0.01, min: 0 }}
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
                    inputProps={{ step: 0.01, min: 0 }}
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
                    inputProps={{ step: 0.01, min: 0 }}
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
                    inputProps={{ step: 0.01, min: 0 }}
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

                <Button
                  variant="contained"
                  onClick={handleAddProduct}
                  disabled={creating}
                >
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
              {filteredProducts.map((prod) => {
                const img = imageByName[prod.name] ?? fallbackImage
                const inCart = cart.some((i) => i.id === prod.id)

                return (
                  <Grid key={prod.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardMedia
                        component="img"
                        height={160}
                        image={img}
                        alt={prod.name}
                        sx={{
                          objectFit: 'contain',
                          bgcolor: 'background.default',
                        }}
                      />

                      <CardContent>
                        <Typography fontWeight={700}>{prod.name}</Typography>
                        <Typography color="text.secondary">
                          {Number(prod.cost).toLocaleString()} ₸
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
                                    id: prod.id,
                                    name: prod.name,
                                    price: Number(prod.cost),
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
                            onClick={() => handleDeleteProduct(prod.id)}
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
                  {c.icon ? (
                    <Box
                      component="img"
                      src={c.icon}
                      alt=""
                      sx={{ width: 20, height: 20, mr: 1, opacity: 0.9 }}
                    />
                  ) : null}

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
