import { ApiHideProperty } from '@nestjs/swagger'
import { PartialType } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { CreateHeadquarterDto } from './create-headquarter.dto'

export class UpdateHeadquarterDto extends PartialType(CreateHeadquarterDto) {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  updatedBy?: string
}
