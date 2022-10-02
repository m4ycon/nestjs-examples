import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'

import { GetUser, Public } from '../common'
import { AuthService } from './auth.service'
import { SignInDto, SignUpDto } from './dto'
import { RtGuard } from './guards'
import { TokenPayload } from './types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() signUpDto: SignUpDto,
  ): Promise<{ message: string }> {
    const tokens = await this.authService.signup(signUpDto)
    this.authService.setAuthCookies(res, tokens)

    return { message: 'User signed up successfully' }
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInDto,
  ): Promise<{ message: string }> {
    const tokens = await this.authService.signin(signInDto)
    this.authService.setAuthCookies(res, tokens)

    return { message: 'User signed in successfully' }
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@GetUser('id') userId: number) {
    return this.authService.signout(userId)
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: TokenPayload & { refreshToken: string },
  ): Promise<{ message: string }> {
    const tokens = await this.authService.refresh(user.id, user.refreshToken)
    this.authService.setAuthCookies(res, tokens)

    return { message: 'User refreshed successfully' }
  }
}
