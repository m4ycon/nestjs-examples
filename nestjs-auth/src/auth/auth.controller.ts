import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'

import { GetUser, Public } from '../common'
import { AuthService } from './auth.service'
import { SignInDto, SignUpDto } from './dto'
import { AtGuard, RtGuard } from './guards'
import { TokenPayload } from './types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto)
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto)
  }

  @UseGuards(AtGuard)
  @Post('signout')
  async signout(@GetUser('id') userId: number) {
    return this.authService.signout(userId)
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@GetUser() user: TokenPayload & { refreshToken: string }) {
    return this.authService.refresh(user.id, user.refreshToken)
  }
}
