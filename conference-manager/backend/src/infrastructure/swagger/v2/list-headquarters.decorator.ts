import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { Headquarter } from '../../../modules/headquarter/headquarter.entity'

export function ListHeadquartersSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Headquarters successfully listed',
      type: [Headquarter],
    })
  )
}
