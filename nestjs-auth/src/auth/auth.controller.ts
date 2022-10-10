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
import { AuthSwagger } from './swagger'
import { TokenPayload } from './types'

@Controller('auth')
@AuthSwagger.controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @AuthSwagger.signup()
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() signUpDto: SignUpDto,
  ) {
    const tokens = await this.authService.signup(signUpDto)
    this.authService.setAuthCookies(res, tokens)

    return { message: 'Sign up successfully' }
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Public()
  @AuthSwagger.signin()
  async signin(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInDto,
  ) {
    const tokens = await this.authService.signin(signInDto)
    this.authService.setAuthCookies(res, tokens)

    return { message: 'Sign in successfully' }
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.signout()
  async signout(
    @Res({ passthrough: true }) res: Response,
    @GetUser('id') userId: number,
  ) {
    await this.authService.signout(userId)
    this.authService.clearAuthCookies(res)

    return { message: 'Sign out successfully' }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @Public()
  @AuthSwagger.refresh()
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: TokenPayload & { refreshToken: string },
  ) {
    const tokens = await this.authService.refresh(
      user.userId,
      user.refreshToken,
    )
    this.authService.setAuthCookies(res, tokens)

    return { message: 'Refresh successfully' }
  }
}
