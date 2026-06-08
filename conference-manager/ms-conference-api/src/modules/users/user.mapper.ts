import { Injectable } from '@nestjs/common'
import { UserResponse } from './interfaces/user-response'
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export default class UserMapper {
  public static toResponse(user: User): UserResponse {
    return {
      _id: String(user._id),
      uid: user.uid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      createdAt: user.createdAt!,
      updatedAt: user.updatedAt!,
    }
  }

  public static toResponseList(users: User[]): UserResponse[] {
    return users.map(u => this.toResponse(u))
  }

  public static createUserMapper(dto: CreateUserDto): Partial<User> {
    return {
      uid: dto.uid,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      isAdmin: false,
      isSuperAdmin: false,
      createdBy: dto.createdBy ?? '',
    }
  }

  public static updateUserMapper(dto: UpdateUserDto): Partial<User> {
    const update: Partial<User> = {}
    if (dto.firstName !== undefined) update.firstName = dto.firstName
    if (dto.lastName !== undefined) update.lastName = dto.lastName
    if (dto.email !== undefined) update.email = dto.email
    if (dto.isAdmin !== undefined) update.isAdmin = dto.isAdmin
    if (dto.updatedBy !== undefined) update.updatedBy = dto.updatedBy
    return update
  }
}
