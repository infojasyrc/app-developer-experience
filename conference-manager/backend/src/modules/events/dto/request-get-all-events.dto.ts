import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'
import { EventStatus } from './create-event.dto'

export class RequestGetAllEventsDto {
  @ApiProperty({
    description: 'The event status',
    required: false,
    enum: EventStatus,
  })
  @IsOptional()
  status?: string

  @ApiProperty({
    description: 'The event headquarter',
    required: false,
  })
  @IsOptional()
  headquarter?: string

  @ApiHideProperty()
  @IsNotEmpty()
  @IsBoolean()
  isAdmin: boolean

  @ApiHideProperty()
  @IsOptional()
  userId?: string

  @ApiProperty({
    description: 'The event year',
    required: false,
  })
  @IsOptional()
  year?: string
}
