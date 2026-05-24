import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { Conference } from '../../../modules/conferences/conference.entity'

export function GetConferenceByIdSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Conference found', type: Conference }),
    ApiResponse({ status: 404, description: 'Conference not found.' })
  )
}
