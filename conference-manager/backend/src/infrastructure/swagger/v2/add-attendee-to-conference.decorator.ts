import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Conference } from '../../../modules/conferences/conference.entity'

export function AddAttendeeToConferenceSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Attendee successfully added to conference', type: Conference }),
    ApiResponse({ status: 400, description: 'Conference is not active or user is already an attendee.' }),
    ApiResponse({ status: 404, description: 'Conference not found.' }),
    ApiBearerAuth()
  )
}
