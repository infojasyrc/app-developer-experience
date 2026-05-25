import { Types } from 'mongoose'

export const MOCK_ROLE_ID = new Types.ObjectId('65b9373f6f3ef0a59e209760')

export const ROLE_MOCK = {
  _id: String(MOCK_ROLE_ID),
  name: 'admin',
}

export const LIST_ROLES_MOCK = [
  { _id: String(MOCK_ROLE_ID), name: 'admin' },
  { _id: String(new Types.ObjectId('65b9373f6f3ef0a59e209761')), name: 'user' },
]
