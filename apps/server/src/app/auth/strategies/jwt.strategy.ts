import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.headers?.['x-access-token']?.toString()?.replace(/^Bearer\s+/i, '')
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY
    })
  }
  async validate(payload: any) {
    //console.log('jwt페이로드제발발발바랍ㄹ', payload)

    return { sub: payload.sub, email: payload.email, role: payload.role, nickname: payload.nickname }
  }
}
