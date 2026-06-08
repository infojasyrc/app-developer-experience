import { Controller, Get, HttpCode, Logger, Param, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

import { RoleService } from './role.service'
import { RoleResponse } from './interfaces/role-response'
import { RolesGuard } from '../guard/roles.guard'
import { Roles } from '../guard/roles.guard.decorator'
import { ADMIN_ROLE } from '../../common/constants'
import { ListRolesSwaggerDecorator } from '../../infrastructure/swagger/v2/list-roles.decorator'
import { GetRoleByIdSwaggerDecorator } from '../../infrastructure/swagger/v2/get-role-by-id.decorator'

@ApiTags('roles')
@Controller('v2/roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ListRolesSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(200)
  async getAll(): Promise<RoleResponse[]> {
    this.logger.log('Get all roles controller')
    return this.roleService.getAll()
  }

  @Get('/:roleId')
  @GetRoleByIdSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('firebase-auth'), RolesGuard)
  @HttpCode(200)
  async getById(@Param('roleId') roleId: string): Promise<RoleResponse> {
    this.logger.log(`Get role by id: ${roleId} controller`)
    return this.roleService.getById(roleId)
  }
}
