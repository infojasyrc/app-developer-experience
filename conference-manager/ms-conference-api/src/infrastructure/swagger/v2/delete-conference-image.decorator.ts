import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger'

export function DeleteConferenceImageSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 204, description: 'Image removed from conference and deleted from storage.' }),
    ApiResponse({ status: 404, description: 'Conference or image not found.' }),
    ApiParam({ name: 'conferenceId', required: true, schema: { type: 'string' } }),
    ApiParam({
      name: 'imageId',
      required: true,
      description: 'URL-encoded image filename returned by the upload endpoint',
      schema: { type: 'string' },
    }),
    ApiBearerAuth()
  )
}
