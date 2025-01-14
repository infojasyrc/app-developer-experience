import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Event } from '../../../modules/events/event.entity'
import { UpdateEventDto } from '../../../modules/events/dto/update-event.dto'

export function UpdateEventSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Event successfully updated', type: Event }),
    ApiResponse({
      status: 400,
      description: 'Bad request, some of the fields did not pass the validation.',
    }),
    ApiResponse({
      status: 404,
      description: 'Passed event id was not found to be updatedt',
    }),
    ApiParam({
      name: 'eventId',
      required: true,
      description: 'the event id to be updated',
      schema: { type: 'string' },
    }),
    ApiBody({ type: UpdateEventDto }),
    ApiBearerAuth()
  )
}
