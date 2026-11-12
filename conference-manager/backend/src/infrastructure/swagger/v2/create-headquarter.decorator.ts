import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Headquarter } from '../../../modules/headquarter/headquarter.entity'

export function CreateHeadquarterSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 201, description: 'Headquarter successfully created', type: Headquarter }),
    ApiResponse({ status: 400, description: 'Bad request, some fields did not pass validation.' }),
    ApiResponse({ status: 409, description: 'A headquarter in that city and country already exists.' }),
    ApiBearerAuth()
  )
}
