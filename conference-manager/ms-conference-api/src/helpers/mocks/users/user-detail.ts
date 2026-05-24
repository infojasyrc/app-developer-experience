import { CreateUserDto } from '../../../modules/users/dto/create-user.dto'
import { UpdateUserDto } from '../../../modules/users/dto/update-user.dto'
import { UserResponse } from '../../../modules/users/interfaces/user-response'

export const USER_MOCK: UserResponse = {
  _id: '65a9ae1f615ad496533cde52',
  uid: 'sRrmUhxMgrhA1WeMyQp9CzzxyO92',
  firstName: 'User',
  lastName: 'App',
  email: 'testuser@chupito.com',
  isAdmin: false,
  isSuperAdmin: false,
}

export const ADMIN_USER_MOCK: UserResponse = {
  _id: '65a9ae1f615ad496533cde53',
  uid: '2qWPHHeRY9b3ouN8deae8GkCUnx1',
  firstName: 'User',
  lastName: 'Admin',
  email: 'adminuser@chupito.com',
  isAdmin: true,
  isSuperAdmin: false,
}

export const LIST_USERS_MOCK: UserResponse[] = [USER_MOCK, ADMIN_USER_MOCK]

export const CREATE_USER_MOCK_DTO: CreateUserDto = {
  uid: 'sRrmUhxMgrhA1WeMyQp9CzzxyO92',
  firstName: 'User',
  lastName: 'App',
  email: 'testuser@chupito.com',
  userId: 'requester-uid-123',
}

export const UPDATE_USER_MOCK_DTO: UpdateUserDto = {
  firstName: 'Updated',
  lastName: 'Name',
  isAdmin: true,
}
