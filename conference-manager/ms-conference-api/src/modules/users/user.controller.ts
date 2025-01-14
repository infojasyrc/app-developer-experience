import { Body, Controller, Get, HttpCode, Logger, Param, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

import { RolesGuard } from '../guard/roles.guard'
import { UserService } from './user.service'
import { AdddUserRequestDto } from './dto/add-user-request.dto'

@ApiTags('UserController')
@Controller('v2/users')
export class UserController {
  constructor(private readonly userService: UserService, private logger: Logger) {}

  @Get('/:uid')
  @HttpCode(200)
  async getByUserId(@Param('uid') uid: string) {
    this.logger.log(`Controller: retrieve by userId: ${uid}`)
    return this.userService.getByUserId({ uid })
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(201)
  async addNewUser(@Body() newUser: AdddUserRequestDto) {
    this.logger.log(`Controller: add new user`)
    return this.userService.addUser(newUser)
  }
}
