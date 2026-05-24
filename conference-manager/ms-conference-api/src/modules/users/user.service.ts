import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from './user.entity'
import { UserResponse } from './interfaces/user-response'
import UserMapper from './user.mapper'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { BadRequestException } from '../../exceptions/BadRequest'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly logger: Logger
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponse> {
    this.logger.log(`Create user service: ${dto.uid}`)
    await this.validateUidUnique(dto.uid)
    await this.validateEmailUnique(dto.email)
    const created = await this.userModel.create(UserMapper.createUserMapper(dto))
    return UserMapper.toResponse(created)
  }

  async getAll(): Promise<UserResponse[]> {
    this.logger.log('Get all users service')
    const users = await this.userModel.find().exec()
    return UserMapper.toResponseList(users)
  }

  async getByUid(uid: string): Promise<UserResponse> {
    this.logger.log(`Get user by uid: ${uid} service`)
    const user = await this.userModel.findOne({ uid })
    if (!user)
      throw new NotFoundException(`Error at get user by uid service, uid: ${uid} was not found`)
    return UserMapper.toResponse(user)
  }

  async update(uid: string, dto: UpdateUserDto): Promise<UserResponse> {
    this.logger.log(`Update user uid: ${uid} service`)
    const mapped = UserMapper.updateUserMapper(dto)
    const updated = await this.userModel
      .findOneAndUpdate({ uid }, mapped, { new: true })
      .exec()
    if (!updated)
      throw new NotFoundException(`Error at update user service, uid: ${uid} was not found`)
    return UserMapper.toResponse(updated)
  }

  async delete(uid: string): Promise<void> {
    this.logger.log(`Delete user uid: ${uid} service`)
    const user = await this.userModel.findOneAndDelete({ uid })
    if (!user)
      throw new NotFoundException(`Error at delete user service, uid: ${uid} was not found`)
  }

  private async validateUidUnique(uid: string): Promise<void> {
    const existing = await this.userModel.findOne({ uid })
    if (existing)
      throw new BadRequestException(`The user with uid: ${uid}, already exists`)
  }

  private async validateEmailUnique(email: string): Promise<void> {
    const existing = await this.userModel.findOne({ email })
    if (existing)
      throw new BadRequestException(`The user with email: ${email}, already exists`)
  }
}
