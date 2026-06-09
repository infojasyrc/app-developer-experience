import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateHeadquarterDto {
  @ApiProperty({ description: 'Headquarter city', required: true })
  @IsString()
  @IsNotEmpty()
  city!: string

  @ApiProperty({ description: 'Headquarter country', required: true })
  @IsString()
  @IsNotEmpty()
  country!: string

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  createdBy?: string
}
