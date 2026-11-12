import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

import { UserService } from '../../modules/users/user.service'
import { UserResponse } from '../../modules/users/interfaces/user-response'
import { CreateUserDto } from '../../modules/users/dto/create-user.dto'
import { UpdateUserDto } from '../../modules/users/dto/update-user.dto'
import { RolesGuard } from '../../modules/guard/roles.guard'
import { Roles } from '../../modules/guard/roles.guard.decorator'
import { ADMIN_ROLE } from '../../common/constants'
import { CreateUserSwaggerDecorator } from '../../infrastructure/swagger/v2/create-user.decorator'
import { ListUsersSwaggerDecorator } from '../../infrastructure/swagger/v2/list-users.decorator'
import { GetUserByUidSwaggerDecorator } from '../../infrastructure/swagger/v2/get-user-by-uid.decorator'
import { UpdateUserSwaggerDecorator } from '../../infrastructure/swagger/v2/update-user.decorator'
import { DeleteUserSwaggerDecorator } from '../../infrastructure/swagger/v2/delete-user.decorator'

@ApiTags('users')
@Controller('/v2/users')
export class UserController {
  constructor(private readonly userService: UserService, private readonly logger: Logger) {}

  @Post()
  @CreateUserSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(201)
  async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    this.logger.log('Create user controller')
    return this.userService.create(dto)
  }

  @Get()
  @ListUsersSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(200)
  async getAll(): Promise<UserResponse[]> {
    this.logger.log('Get all users controller')
    return this.userService.getAll()
  }

  @Get('/:uid')
  @GetUserByUidSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(200)
  async getByUid(@Param('uid') uid: string): Promise<UserResponse> {
    this.logger.log(`Get user by uid: ${uid} controller`)
    return this.userService.getByUid(uid)
  }

  @Put('/:uid')
  @UpdateUserSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(200)
  async update(@Param('uid') uid: string, @Body() dto: UpdateUserDto): Promise<UserResponse> {
    this.logger.log(`Update user uid: ${uid} controller`)
    return this.userService.update(uid, dto)
  }

  @Delete('/:uid')
  @DeleteUserSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(204)
  async delete(@Param('uid') uid: string): Promise<void> {
    this.logger.log(`Delete user uid: ${uid} controller`)
    return this.userService.delete(uid)
  }
}
