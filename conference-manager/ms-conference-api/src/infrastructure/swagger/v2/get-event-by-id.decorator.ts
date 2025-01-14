import { applyDecorators } from '@nestjs/common'
import { ApiParam, ApiResponse } from '@nestjs/swagger'
import { Event } from '../../../modules/events/event.entity'

export function GetEventByIdSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Event successfully retrieved', type: Event }),
    ApiResponse({
      status: 400,
      description: 'Bad request, some of the fields did not pass the validation.',
    }),
    ApiResponse({
      status: 404,
      description: 'Passed event id was not found to be retrieved',
    }),
    ApiParam({
      name: 'eventId',
      required: true,
      description: 'the event id to be listed',
      schema: { type: 'string' },
    })
  )
}
