import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { GetUser, LocalGuard } from '../common'
import { SignUpDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto)
  }

  @UseGuards(LocalGuard) // this guard is responsible to sign in
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@GetUser() user: any) {
    return user
  }

  @Get('signout')
  async signout(@Req() request: Request) {
    request.session.destroy(() => null)

    return { message: 'Succesfully logged out' }
  }
}
