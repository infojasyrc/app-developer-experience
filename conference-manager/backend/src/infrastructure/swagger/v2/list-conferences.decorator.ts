import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { Conference } from '../../../modules/conferences/conference.entity'

export function ListConferencesSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'List of conferences returned', type: [Conference] })
  )
}
