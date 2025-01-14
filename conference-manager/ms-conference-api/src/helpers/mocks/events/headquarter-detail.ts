import { Types } from 'mongoose'

export const MOCKOBJECTID = new Types.ObjectId('65b9373f6f3ef0a59e20975a')

export const HEADQUARTERMOCK = {
  _id: MOCKOBJECTID,
  name: 'Bogota',
}

export const LISTHEADQUARTERMOCK = [
  {
    _id: MOCKOBJECTID,
    name: 'Bogota',
  },
  {
    _id: MOCKOBJECTID,
    name: 'Ecuador',
  },
  {
    _id: MOCKOBJECTID,
    name: 'Panama',
  },
]
