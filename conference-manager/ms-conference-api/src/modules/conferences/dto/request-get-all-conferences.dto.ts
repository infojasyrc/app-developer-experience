import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

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
    description: 'Is admin',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isAdmin: boolean = false

  @ApiHideProperty()
  @IsOptional()
  createdBy?: string

  @ApiProperty({
    description: 'Conference year',
    required: false,
  })
  @IsOptional()
  year?: string
}
