import { PartialType } from '@nestjs/swagger'
import { CreateEventDto, EventStatus } from './create-event.dto'
import { IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({
    description: 'The event status',
    required: false,
    enum: EventStatus,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus

  @IsOptional()
  year?: string
}
