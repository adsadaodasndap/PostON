import { Request, Response } from 'express'
import { Postomat, Slot } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'

export const getPostomats = async (req: Request, res: Response) => {
  try {
    const postomats = await Postomat.findAll()
    return res.json({ postomats })
  } catch (e) {
    return unexpectedError(res, e)
  }
}

export const getPostomatSlots = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const slots = await Slot.findAll({ where: { postomat_id: id } })
    return res.json({ slots })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
