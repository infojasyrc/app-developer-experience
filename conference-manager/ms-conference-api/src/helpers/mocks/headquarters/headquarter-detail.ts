import { Types } from 'mongoose'
import { CreateHeadquarterDto } from '../../../modules/headquarter/dto/create-headquarter.dto'
import { UpdateHeadquarterDto } from '../../../modules/headquarter/dto/update-headquarter.dto'
import { HeadquarterResponse } from '../../../modules/headquarter/interfaces/headquarter-response'

export const MOCKOBJECTID     = new Types.ObjectId('65b9373f6f3ef0a59e20975a')
export const MOCK_CREATED_BY  = 'user-uid-123'
export const MOCK_AUDIT_DATE  = new Date('2026-01-01T00:00:00.000Z')

export const HEADQUARTERMOCK: HeadquarterResponse = {
  _id: String(MOCKOBJECTID),
  name: 'Bogota',
  createdBy: MOCK_CREATED_BY,
  createdAt: MOCK_AUDIT_DATE,
  updatedAt: MOCK_AUDIT_DATE,
}

export const LISTHEADQUARTERMOCK: HeadquarterResponse[] = [
  { _id: String(MOCKOBJECTID),                                      name: 'Bogota',  createdBy: MOCK_CREATED_BY, createdAt: MOCK_AUDIT_DATE, updatedAt: MOCK_AUDIT_DATE },
  { _id: String(new Types.ObjectId('65b9373f6f3ef0a59e20975b')),   name: 'Ecuador', createdBy: MOCK_CREATED_BY, createdAt: MOCK_AUDIT_DATE, updatedAt: MOCK_AUDIT_DATE },
  { _id: String(new Types.ObjectId('65b9373f6f3ef0a59e20975c')),   name: 'Panama',  createdBy: MOCK_CREATED_BY, createdAt: MOCK_AUDIT_DATE, updatedAt: MOCK_AUDIT_DATE },
]

export const CREATE_HEADQUARTER_MOCK_DTO: CreateHeadquarterDto = {
  name: 'Bogota',
  createdBy: MOCK_CREATED_BY,
}

export const UPDATE_HEADQUARTER_MOCK_DTO: UpdateHeadquarterDto = {
  name: 'Bogota Updated',
}
