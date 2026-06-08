import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { PartialType } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Admin flag', required: false })
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  updatedBy?: string
}
