import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Role } from './role.entity'
import { RoleResponse } from './interfaces/role-response'
import RoleMapper from './role.mapper'
import { NotFoundException } from '../../exceptions/NotFound.exception'

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    private readonly logger: Logger,
  ) {}

  async getAll(): Promise<RoleResponse[]> {
    this.logger.log('Get all roles service')
    const roles = await this.roleModel.find().exec()
    return RoleMapper.toResponseList(roles)
  }

  async getById(roleId: string): Promise<RoleResponse> {
    this.logger.log(`Get role by id: ${roleId} service`)
    const role = await this.roleModel.findById(roleId)
    if (!role)
      throw new NotFoundException(`Error at get role by id service, _id: ${roleId} was not found`)
    return RoleMapper.toResponse(role)
  }
}
