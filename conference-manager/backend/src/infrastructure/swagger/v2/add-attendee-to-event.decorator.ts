import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Event } from '../../../modules/events/event.entity'

export function AddAttendeeToEventSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Attendee added to event', type: Event }),
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
      description: 'the event id to add user to',
      schema: { type: 'string' },
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'the user id to be add to an event',
      schema: { type: 'string' },
    }),
    ApiBearerAuth()
  )
}
