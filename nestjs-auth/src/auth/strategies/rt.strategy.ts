import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { CookieUtils } from '../../common'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return CookieUtils.getCookieValue(req, 'refreshToken')
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_RT_SECRET'),
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: any) {
    const refreshToken = CookieUtils.getCookieValue(req, 'refreshToken')

    // request.user = payload
    return { ...payload, refreshToken }
  }
}
