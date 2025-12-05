import { Request as ExpressRequest } from 'express'
import { User } from '../db/models'

export type Request = ExpressRequest & {
  user?: User
}
