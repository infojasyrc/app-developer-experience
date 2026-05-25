import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

import { Role } from '../../../modules/roles/role.entity'

export function ListRolesSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Roles successfully listed.', type: [Role] }),
    ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' }),
    ApiResponse({ status: 403, description: 'Forbidden — admin role required.' }),
    ApiBearerAuth(),
  )
}
