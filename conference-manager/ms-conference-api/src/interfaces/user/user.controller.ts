import { Body, Controller, Get, HttpCode, Logger, Param, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
// import { AuthGuard } from '@nestjs/passport'

// import { RolesGuard } from '../guard/roles.guard'
// import { UserService } from './user.service'
// import { AdddUserRequestDto } from './dto/add-user-request.dto'
import { FirebaseAuthGuard } from '../auth/firebase.guard'
import { GetUsersUseCase } from '../../application/use-cases/user/get-users.usecase'

@ApiTags('UserController')
@Controller('/v2/users')
export class UserController {
  constructor(private readonly getUsers: GetUsersUseCase, private logger: Logger) {}
  // constructor(private readonly userService: UserService, private logger: Logger) {}

  // @Get('/:uid')
  // @HttpCode(200)
  // async getByUserId(@Param('uid') uid: string) {
  //   this.logger.log(`Controller: retrieve by userId: ${uid}`)
  //   return this.userService.getByUserId({ uid })
  // }

  // @Post('')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @HttpCode(201)
  // async addNewUser(@Body() newUser: AdddUserRequestDto) {
  //   this.logger.log(`Controller: add new user`)
  //   // return this.userService.addUser(newUser)
  // }

  @UseGuards(FirebaseAuthGuard)
  @Get('/')
  @HttpCode(200)
  async getAllUsers() {
    this.logger.log(`Controller: retrieve all users`)
    return this.getUsers.execute()
  }
}
