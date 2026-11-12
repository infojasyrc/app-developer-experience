import { ApiProperty } from '@nestjs/swagger'
import { Types } from 'mongoose'

export class ConferenceIdDto {
  @ApiProperty({ description: 'Conference ObjectId', required: true })
  conferenceId!: Types.ObjectId
}
