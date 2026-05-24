import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiProduces, ApiResponse } from '@nestjs/swagger'

export function ExportConferenceAttendeesSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'CSV file containing conference attendees.' }),
    ApiResponse({ status: 404, description: 'Conference not found.' }),
    ApiParam({ name: 'conferenceId', required: true, schema: { type: 'string' } }),
    ApiProduces('text/csv'),
    ApiBearerAuth()
  )
}
