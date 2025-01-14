import { ApiProperty } from '@nestjs/swagger'
import { Types } from 'mongoose'

export class EventIdDto {
  @ApiProperty({
    description: 'The event id',
    required: true,
  })
  eventId!: Types.ObjectId
}
