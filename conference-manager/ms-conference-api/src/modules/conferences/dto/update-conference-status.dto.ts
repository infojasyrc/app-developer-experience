import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'

import { ConferenceStatus } from '../conference.enum'

export class UpdateConferenceStatusDto {
  @ApiProperty({ enum: ConferenceStatus, description: 'The new conference status' })
  @IsEnum(ConferenceStatus)
  @IsNotEmpty()
  status!: ConferenceStatus

  @ApiHideProperty()
  @IsOptional()
  userId?: string
}
