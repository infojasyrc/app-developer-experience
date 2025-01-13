import { IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class UserIdDto {
  userId!: Types.ObjectId
}
