import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Conference } from '../../../modules/conferences/conference.entity'

export function UpdateConferenceSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Conference successfully updated', type: Conference }),
    ApiResponse({ status: 400, description: 'Bad request, some fields did not pass validation.' }),
    ApiResponse({ status: 404, description: 'Conference not found.' }),
    ApiBearerAuth()
  )
}
