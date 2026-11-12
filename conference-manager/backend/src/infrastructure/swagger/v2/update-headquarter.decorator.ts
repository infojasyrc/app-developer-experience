import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Headquarter } from '../../../modules/headquarter/headquarter.entity'

export function UpdateHeadquarterSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Headquarter successfully updated', type: Headquarter }),
    ApiResponse({ status: 400, description: 'Bad request, some fields did not pass validation.' }),
    ApiResponse({ status: 404, description: 'Headquarter not found.' }),
    ApiBearerAuth()
  )
}
