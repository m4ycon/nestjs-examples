import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common'
import { Request } from 'express'

import { AuthService } from './auth.service'
import { SignInDto, SignUpDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto)
  }

  // @UseGuards(LocalGuard) // this guard is responsible to sign in
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto)
  }

  @Get('signout')
  async signout(@Req() request: Request) {
    request.session.destroy(() => null)

    return { message: 'Succesfully logged out' }
  }

  @Post('refresh')
  async refresh(@Req() request: Request) {
    return this.authService.refresh(request)
  }
}
