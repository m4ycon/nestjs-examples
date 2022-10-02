import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'

import { UsersService } from '../users/users.service'
import { SignInDto, SignUpDto } from './dto'
import { AuthServiceInterface } from './interfaces'
import { TokenPayload, Tokens } from './types'

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    // passwordConfirmation is tested in the validation pipe
    // so we can safely ignore it here
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirmation, ...userData } = signUpDto
    const hashedPassword = await this.hashData(userData.password)

    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    })

    return this.signTokensAndUpdateRefreshToken(user.id, user.email)
  }

  // used inside the local.strategy.ts
  async signin(signInDto: SignInDto) {
    const { email, password } = signInDto
    const user = await this.usersService.getUserInfo({ email })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const passMatches = await this.compareHashes(password, user.password)
    if (!passMatches) throw new UnauthorizedException('Invalid credentials')

    return this.signTokensAndUpdateRefreshToken(user.id, user.email)
  }

  async signout(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null)
    return { message: 'Successfully logged out' }
  }

  async refresh(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.getUserInfo({ id: userId })
    if (!user || !user.hashedRt)
      throw new UnauthorizedException('Invalid credentials')

    const rtMatches = await this.compareHashes(refreshToken, user.hashedRt)
    if (!rtMatches) throw new UnauthorizedException('Invalid credentials')

    return this.signTokensAndUpdateRefreshToken(user.id, user.email)
  }

  async signTokensAndUpdateRefreshToken(
    userId: number,
    email: string,
  ): Promise<Tokens> {
    const tokens = await this.signTokens(userId, email)

    const hashedRefreshToken = await this.hashData(tokens.refreshToken)
    await this.usersService.updateHashedRefreshToken(userId, hashedRefreshToken)

    return tokens
  }

  async signTokens(userId: number, email: string): Promise<Tokens> {
    const payload: TokenPayload = { id: userId, email }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_RT_SECRET'),
        expiresIn: '7d',
      }),
    ])

    return { accessToken, refreshToken }
  }

  async hashData(data: string): Promise<string> {
    return argon2.hash(data)
  }

  async compareHashes(data: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, data)
  }
}
