import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

export function DeleteConferenceSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 204, description: 'Conference soft-deleted (status set to inactive).' }),
    ApiResponse({ status: 404, description: 'Conference not found.' }),
    ApiBearerAuth()
  )
}
