import { Types } from 'mongoose'

export interface UserResponse {
  _id: Types.ObjectId
  uid: string
  firstName: string
  lastName: string
  isAdmin: boolean
  email: string
}
