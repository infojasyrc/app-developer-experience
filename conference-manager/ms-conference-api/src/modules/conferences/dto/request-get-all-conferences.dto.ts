import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

import { ConferenceStatus } from '../conference.enum'

export class RequestGetAllConferencesDto {
  @ApiProperty({
    description: 'conference status',
    required: false,
    enum: ConferenceStatus,
  })
  @IsOptional()
  status?: string

  @ApiProperty({
    description: 'Conference headquarter',
    required: false,
  })
  @IsOptional()
  headquarter?: string

  @ApiProperty({
    description: 'Conference headquarter',
    required: false,
  })
  @IsBoolean()
  isAdmin: boolean = false

  @ApiHideProperty()
  @IsOptional()
  userId?: string

  @ApiProperty({
    description: 'Conference year',
    required: false,
  })
  @IsOptional()
  year?: string
}
