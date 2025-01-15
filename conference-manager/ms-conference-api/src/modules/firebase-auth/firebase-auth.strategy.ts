import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import getEnvironmentVariables from '../../infrastructure/environment'

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const { PRIVATE_KEY_V2 } = getEnvironmentVariables()

    if (!PRIVATE_KEY_V2) {
      throw new Error('Undefined AUTH_PRIVATE_KEY')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: PRIVATE_KEY_V2.replace(/\\n/g, '\n'),
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role }
  }
}
