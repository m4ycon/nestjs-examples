import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { CookieUtils } from '../../common/utils'
import { TokenPayload } from '../types'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => CookieUtils.getCookieValue(req, 'refreshToken'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_RT_SECRET'),
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: TokenPayload) {
    const refreshToken = CookieUtils.getCookieValue(req, 'refreshToken')

    return { ...payload, refreshToken }
  }
}
