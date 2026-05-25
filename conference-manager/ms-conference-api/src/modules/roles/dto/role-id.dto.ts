import { ApiProperty } from '@nestjs/swagger'
import { Types } from 'mongoose'

export class RoleIdDto {
  @ApiProperty({ description: 'Role ObjectId', required: true })
  roleId!: Types.ObjectId
}
