import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

export function DeleteUserSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 204, description: 'User successfully deleted.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
    ApiBearerAuth()
  )
}
