import { Injectable } from '@nestjs/common'
import { Role } from './role.entity'
import { RoleResponse } from './interfaces/role-response'

@Injectable()
export default class RoleMapper {
  public static toResponse(role: Role): RoleResponse {
    return {
      _id: String(role._id),
      name: role.name,
    }
  }

  public static toResponseList(roles: Role[]): RoleResponse[] {
    return roles.map(role => this.toResponse(role))
  }
}
