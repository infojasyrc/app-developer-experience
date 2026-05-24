import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger'

import { UpdateConferenceStatusDto } from '../../../modules/conferences/dto/update-conference-status.dto'
import { Conference } from '../../../modules/conferences/conference.entity'

export function UpdateConferenceStatusSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Conference status updated.', type: Conference }),
    ApiResponse({ status: 400, description: 'Invalid status value.' }),
    ApiResponse({ status: 404, description: 'Conference not found.' }),
    ApiParam({ name: 'conferenceId', required: true, schema: { type: 'string' } }),
    ApiBody({ type: UpdateConferenceStatusDto }),
    ApiBearerAuth()
  )
}
