import { Router } from 'express'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController'
import accessLevel from '../middleware/accessLevel'

const router = Router()
router.get('/', getProducts)
router.get('/:id', getProduct)
router.post('/', accessLevel(['ADMIN', 'SELLER']), createProduct)
router.put('/:id', accessLevel(['ADMIN', 'SELLER']), updateProduct)
router.delete('/:id', accessLevel(['ADMIN', 'SELLER']), deleteProduct)

export default router
