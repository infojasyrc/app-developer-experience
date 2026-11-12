import { applyDecorators } from '@nestjs/common'
import { ApiParam, ApiResponse } from '@nestjs/swagger'
import { Headquarter } from '../../../modules/headquarter/headquarter.entity'

export function GetHeadquarterByIdSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Headquarter successfully retrieved',
      type: Headquarter,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request, some of the fields did not pass the validation.',
    }),
    ApiResponse({
      status: 404,
      description: 'Passed headquarter id was not found to be retrieved',
    }),
    ApiParam({
      name: 'headquarterId',
      required: true,
      description: 'the headquarter id to be listed',
      schema: { type: 'string' },
    })
  )
}
