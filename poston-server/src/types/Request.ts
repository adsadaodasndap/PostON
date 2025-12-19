import type { Request as ExpressRequest } from 'express'
import type { User } from '../db/models'

export type Request = ExpressRequest & {
  user?: User
}
