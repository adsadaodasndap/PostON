import { Request, Response } from 'express'
import { Product } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll()
    return res.json({ products })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const product = await Product.findByPk(id)
    if (!product) return res.status(404).json({ message: 'Товар не найден' })
    return res.json({ product })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, cost, length, width, height, weight } = req.body
    if (!name || !cost || !length || !width || !height || !weight) {
      return res.status(400).json({ message: 'Заполните все поля товара' })
    }
    const newProduct = await Product.create({
      name,
      cost,
      length,
      width,
      height,
      weight,
    })
    return res
      .status(201)
      .json({ message: 'Товар создан', product: newProduct })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, cost, length, width, height, weight } = req.body
    const product = await Product.findByPk(id)
    if (!product) return res.status(404).json({ message: 'Товар не найден' })
    await Product.update(
      { name, cost, length, width, height, weight },
      { where: { id: product.id } }
    )
    const updated = await Product.findByPk(id)
    return res.json({ message: 'Товар обновлен', product: updated })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const product = await Product.findByPk(id)
    if (!product) return res.status(404).json({ message: 'Товар не найден' })
    await Product.destroy({ where: { id: product.id } })
    return res.json({ message: 'Товар удален' })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
