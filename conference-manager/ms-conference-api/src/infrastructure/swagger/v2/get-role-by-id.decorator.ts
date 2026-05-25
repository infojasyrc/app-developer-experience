import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger'

import { Role } from '../../../modules/roles/role.entity'

export function GetRoleByIdSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Role successfully retrieved.', type: Role }),
    ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' }),
    ApiResponse({ status: 403, description: 'Forbidden — admin role required.' }),
    ApiResponse({ status: 404, description: 'Role not found.' }),
    ApiParam({ name: 'roleId', required: true, description: 'Role ObjectId', schema: { type: 'string' } }),
    ApiBearerAuth(),
  )
}
