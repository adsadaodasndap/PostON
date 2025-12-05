import { Request, Response } from 'express'
import { Branch } from '../db/models'
import unexpectedError from '../helpers/unexpectedError'

export const getBranches = async (req: Request, res: Response) => {
  try {
    const branches = await Branch.findAll()
    return res.json({ branches })
  } catch (e) {
    return unexpectedError(res, e)
  }
}
