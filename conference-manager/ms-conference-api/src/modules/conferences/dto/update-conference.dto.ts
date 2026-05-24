import { PartialType } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CreateConferenceDto } from './create-conference.dto'
import { ConferenceStatus } from '../conference.enum'

export class UpdateConferenceDto extends PartialType(CreateConferenceDto) {
  @ApiProperty({ description: 'Conference status', required: false, enum: ConferenceStatus })
  @IsOptional()
  @IsEnum(ConferenceStatus)
  status?: ConferenceStatus

  @IsOptional()
  year?: string
}
