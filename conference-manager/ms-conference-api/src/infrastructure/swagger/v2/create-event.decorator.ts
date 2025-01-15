import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiResponse } from '@nestjs/swagger'
import { Event } from '../../../modules/events/event.entity'

export function CreateEventSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Event successfully created', type: Event }),
    ApiResponse({
      status: 400,
      description: 'Bad request, some of the fields did not pass the validation.',
    }),
    ApiResponse({
      status: 409,
      description: 'Passed event name already exist',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth()
  )
}
