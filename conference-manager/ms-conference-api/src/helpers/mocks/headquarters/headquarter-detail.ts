import { Types } from 'mongoose'
import { CreateHeadquarterDto } from '../../../modules/headquarter/dto/create-headquarter.dto'
import { UpdateHeadquarterDto } from '../../../modules/headquarter/dto/update-headquarter.dto'

export const MOCKOBJECTID = new Types.ObjectId('65b9373f6f3ef0a59e20975a')

export const HEADQUARTERMOCK = {
  _id: String(MOCKOBJECTID),
  name: 'Bogota',
}

export const LISTHEADQUARTERMOCK = [
  { _id: String(MOCKOBJECTID), name: 'Bogota' },
  { _id: String(new Types.ObjectId('65b9373f6f3ef0a59e20975b')), name: 'Ecuador' },
  { _id: String(new Types.ObjectId('65b9373f6f3ef0a59e20975c')), name: 'Panama' },
]

export const CREATE_HEADQUARTER_MOCK_DTO: CreateHeadquarterDto = {
  name: 'Bogota',
  userId: 'user-uid-123',
}

export const UPDATE_HEADQUARTER_MOCK_DTO: UpdateHeadquarterDto = {
  name: 'Bogota Updated',
}
