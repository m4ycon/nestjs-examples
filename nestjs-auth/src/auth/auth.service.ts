import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { Response } from 'express'

import { CookieUtils } from '../common/utils'
import { UsersService } from '../users/users.service'
import { SignInDto, SignUpDto } from './dto'
import { AuthServiceInterface } from './interfaces'
import { TokenPayload, Tokens } from './types'

@Injectable()
export class AuthService implements AuthServiceInterface {
  COOKIES_NAMES: Tokens

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.COOKIES_NAMES = {
      accessToken: configService.get('JWT_AT_COOKIE_NAME'),
      refreshToken: configService.get('JWT_RT_COOKIE_NAME'),
    }
  }

  async signup(signUpDto: SignUpDto) {
    const hash = await this.hashData(signUpDto.password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirmation, ...userData } = signUpDto

    const user = await this.usersService.create({
      ...userData,
      password: hash,
    })

    return this.updateRtAndGetNewTokens(user.id, user.email)
  }

  async signin(signInDto: SignInDto) {
    const user = await this.usersService.findOne({
      email: signInDto.email,
    })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const passwordMatch = await this.compareHash(
      signInDto.password,
      user.password,
    )
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials')

    return this.updateRtAndGetNewTokens(user.id, user.email)
  }

  async signout(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null)
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne({ id: userId })
    if (!user || !user.hashedRt)
      throw new UnauthorizedException('Invalid credentials')

    const rtMatch = await this.compareHash(refreshToken, user.hashedRt)
    if (!rtMatch) throw new UnauthorizedException('Invalid credentials')

    return this.updateRtAndGetNewTokens(user.id, user.email)
  }

  async updateRtAndGetNewTokens(
    userId: number,
    email: string,
  ): Promise<Tokens> {
    const tokens = await this.signTokens(userId, email)
    await this.updateRefreshToken(userId, tokens.refreshToken)

    return tokens
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRt = await this.hashData(refreshToken)
    await this.usersService.updateHashedRefreshToken(userId, hashedRt)
  }

  async signTokens(userId: number, email: string): Promise<Tokens> {
    const payload: TokenPayload = { userId, email }

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(payload, {
        expiresIn: parseInt(this.configService.get('JWT_AT_EXPIRATION')),
        secret: this.configService.get('JWT_AT_SECRET'),
      }),
      await this.jwtService.signAsync(payload, {
        expiresIn: parseInt(this.configService.get('JWT_RT_EXPIRATION')),
        secret: this.configService.get('JWT_RT_SECRET'),
      }),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  setAuthCookies(res: Response, tokens: Tokens) {
    CookieUtils.setHeaderWithCookie(
      res,
      this.COOKIES_NAMES.accessToken,
      tokens.accessToken,
      parseInt(this.configService.get('JWT_AT_EXPIRATION')),
    )

    CookieUtils.setHeaderWithCookie(
      res,
      this.COOKIES_NAMES.refreshToken,
      tokens.refreshToken,
      parseInt(this.configService.get('JWT_RT_EXPIRATION')),
    )
  }

  clearAuthCookies(res: Response) {
    CookieUtils.clearCookie(res, this.COOKIES_NAMES.accessToken)
    CookieUtils.clearCookie(res, this.COOKIES_NAMES.refreshToken)
  }

  async hashData(data: string) {
    return argon2.hash(data)
  }

  async compareHash(data: string, hash: string) {
    return argon2.verify(hash, data)
  }
}
