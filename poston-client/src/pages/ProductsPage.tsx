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

// ⚠️ КЛЮЧИ = ТОЧНОЕ prod.name ИЗ БД
const imageByName: Record<string, string> = {
  'Процессор Intel Core i5-12400F':
    '/catalog/Процессор Intel Core i5-12400F.jpg',
  'Процессор AMD Ryzen 5 5600': '/catalog/Процессор AMD Ryzen 5 5600.jpg',

  'Видеокарта NVIDIA RTX 3060 12GB':
    '/catalog/Видеокарта NVIDIA RTX 3060 12GB.jpg',
  'Видеокарта AMD Radeon RX 6700 XT':
    '/catalog/Видеокарта AMD Radeon RX 6700 XT.jpg',

  'Материнская плата ASUS PRIME B660M':
    '/catalog/Материнская плата ASUS PRIME B660M.jpg',
  'Материнская плата MSI B550-A PRO':
    '/catalog/Материнская плата MSI B550-A PRO.jpg',

  'Оперативная память DDR4 16GB (2x8) 3200MHz':
    '/catalog/Оперативная память DDR4 16GB (2x8) 3200MHz.jpg',
  'Оперативная память DDR5 32GB (2x16) 5600MHz':
    '/catalog/Оперативная память DDR5 32GB (2x16) 5600MHz.jpg',

  'SSD NVMe 1TB Samsung 980': '/catalog/SSD NVMe 1TB Samsung 980.jpg',
  'SSD SATA 512GB Kingston A400': '/catalog/SSD SATA 512GB Kingston A400.jpg',
  'Жёсткий диск HDD 2TB Seagate Barracuda':
    '/catalog/Жёсткий диск HDD 2TB Seagate Barracuda.jpg',

  'Блок питания 650W Corsair RM650':
    '/catalog/Блок питания 650W Corsair RM650.jpg',
  'Блок питания 750W Cooler Master MWE':
    '/catalog/Блок питания 750W Cooler Master MWE.jpg',

  'Корпус ATX NZXT H510': '/catalog/Корпус ATX NZXT H510.jpg',
  'Корпус Micro-ATX Deepcool Matrexx 40':
    '/catalog/Корпус Micro-ATX Deepcool Matrexx 40.jpg',

  'Кулер для процессора Cooler Master Hyper 212':
    '/catalog/Кулер для процессора Cooler Master Hyper 212.jpg',
  'Вентилятор 120mm Arctic P12': '/catalog/Вентилятор 120mm Arctic P12.jpg',
  'Водяное охлаждение 240mm Deepcool GAMMAXX':
    '/catalog/Водяное охлаждение 240mm Deepcool GAMMAXX.jpg',

  'Термопаста Arctic MX-4 (4 г)': '/catalog/Термопаста Arctic MX-4 (4 г).jpg',
  'Звуковая карта PCI-E Creative Sound Blaster':
    '/catalog/Звуковая карта PCI-E Creative Sound Blaster.jpg',
  'Клавиатура механическая Red Switch':
    '/catalog/Клавиатура механическая Red Switch.jpg',
  'Ковёр для мыши XL': '/catalog/Ковёр для мыши XL.jpg',

  'Монитор 24 IPS 144Hz': '/catalog/Монитор 24 IPS 144Hz.jpg',
  'Мышь игровая 16000 DPI': '/catalog/Мышь игровая 16000 DPI.jpg',
  'Wi-Fi адаптер USB AC1300': '/catalog/Wi-Fi адаптер USB AC1300.jpg',
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
    getProducts().then((res) => {
      if (res?.products) setProducts(res.products as Product[])
    })
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

    const res = await getProducts()
    if (res?.products) setProducts(res.products as Product[])
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
        {/* ТОВАРЫ */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Товары
          </Typography>

          {isManager && (
            <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
              <Typography variant="h6">Добавить товар</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={1.5} sx={{ maxWidth: 500 }}>
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
              const rawImg = imageByName[p.name] ?? fallbackImage
              const img = encodeURI(rawImg)
              const inCart = cart.some((c) => c.id === p.id)

              return (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined">
                    <CardMedia
                      component="img"
                      height={160}
                      image={img}
                      alt={p.name}
                      sx={{
                        objectFit: 'contain',
                        bgcolor: 'background.default',
                      }}
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

        {/* КАТЕГОРИИ */}
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
