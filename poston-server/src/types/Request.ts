import { Request as ERequest } from 'express'
import { User } from '../db/models.js'

export type Request = ERequest & {
  user: User
}
