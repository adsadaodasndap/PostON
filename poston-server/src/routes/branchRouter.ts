import { Router } from 'express'
import { getBranches } from '../controllers/branchController'

// @ts-expect-error ????
const router = new Router()
router.get('/', getBranches)

export default router
