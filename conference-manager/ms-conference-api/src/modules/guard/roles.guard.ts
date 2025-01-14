import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!requiredRoles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user

    request.body = { userId: user.userId, ...request.body }

    return requiredRoles.some(role => user.role?.includes(role))
  }
}
