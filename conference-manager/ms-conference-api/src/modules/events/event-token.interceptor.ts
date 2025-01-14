import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { JwtPayload, decode } from 'jsonwebtoken'
import { ADMIN_ROLE } from '../../common/constants';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null

    if(!token) {
      request.query = { isAdmin: false, ...request.query}
      return next.handle()
    }
    const decodedToken = decode(token) as JwtPayload;
    request.query = { isAdmin: decodedToken.role === ADMIN_ROLE, userId: decodedToken.sub, ...request.query}
    return next.handle();
  }
}
