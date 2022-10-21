import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { CookieUtils } from '../../common/utils'
import { TokenPayload } from '../types'

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) =>
          CookieUtils.getCookieValue(
            req,
            configService.get('JWT_AT_COOKIE_NAME'),
          ),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_AT_SECRET'),
    })
  }

  async validate(payload: TokenPayload) {
    // request.user = payload
    return payload
  }
}
