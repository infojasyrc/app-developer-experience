import { applyDecorators } from '@nestjs/common'
import { ApiQuery, ApiResponse } from '@nestjs/swagger'
import { Event } from '../../../modules/events/event.entity'
import { EventStatus } from '../../../modules/events/dto/create-event.dto'

export function ListEventsSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Events successfully listed', type: [Event] }),
    ApiResponse({
      status: 400,
      description: 'Bad request, some of the fields did not pass the validation.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      description: 'status to filter list events',
      enum: EventStatus,
    }),
    ApiQuery({
      name: 'headquarter',
      required: false,
      description: 'headquarter to filter list events',
      schema: { type: 'string' },
    }),
    ApiQuery({
      name: 'year',
      required: false,
      description: 'year to filter list events',
      schema: { type: 'string' },
    })
  )
}
