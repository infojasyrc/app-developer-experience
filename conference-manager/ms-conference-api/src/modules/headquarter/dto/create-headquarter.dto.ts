import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateHeadquarterDto {
  @ApiProperty({ description: 'Unique headquarter name', required: true })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiHideProperty()
  @IsOptional()
  userId?: string
}
