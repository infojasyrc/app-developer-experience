import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiResponse } from '@nestjs/swagger'

import { Conference } from '../../../modules/conferences/conference.entity'

export function UploadConferenceImageSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Image uploaded and linked to the conference.', type: Conference }),
    ApiResponse({ status: 400, description: 'Only JPG images are allowed.' }),
    ApiResponse({ status: 404, description: 'Conference not found.' }),
    ApiParam({ name: 'conferenceId', required: true, schema: { type: 'string' } }),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth()
  )
}
