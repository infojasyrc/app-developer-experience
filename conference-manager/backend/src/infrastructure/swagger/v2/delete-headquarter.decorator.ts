import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

export function DeleteHeadquarterSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 204, description: 'Headquarter successfully deleted.' }),
    ApiResponse({ status: 400, description: 'Cannot delete headquarter with linked conferences.' }),
    ApiResponse({ status: 404, description: 'Headquarter not found.' }),
    ApiBearerAuth()
  )
}
