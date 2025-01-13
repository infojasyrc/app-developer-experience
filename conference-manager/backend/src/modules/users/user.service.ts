import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { UserRequestDto } from './dto/user-request.dto'
import { AdddUserRequestDto } from './dto/add-user-request.dto'
import { UserResponse } from './interfaces/user-response'
import { User } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly logger: Logger
  ) {}

  async getByUserId(uid: UserRequestDto): Promise<UserResponse> {
    this.logger.log(`Get user by id: ${JSON.stringify(uid)}`)
    const user = await this.userModel.findOne(uid)

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  async addUser(user: AdddUserRequestDto): Promise<UserResponse> {
    this.logger.log(`Add user: ${JSON.stringify(user)}`)
    // setting user by default as not admin
    const newUser = new this.userModel({ ...user, isAdmin: false })
    return newUser.save()
  }
}
