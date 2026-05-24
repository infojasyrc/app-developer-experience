import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiResponse } from '@nestjs/swagger'
import { Conference } from '../../../modules/conferences/conference.entity'

export function CreateConferenceSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 201, description: 'Conference successfully created', type: Conference }),
    ApiResponse({ status: 400, description: 'Bad request, some fields did not pass validation.' }),
    ApiResponse({ status: 409, description: 'A conference with that name already exists.' }),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth()
  )
}
