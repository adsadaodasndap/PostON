import { Request as ERequest } from 'express'
import { User } from '../db/models'

export type Request = ERequest & {
  user: User
}
