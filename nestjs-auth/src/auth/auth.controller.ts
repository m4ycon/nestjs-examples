import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { GetUser } from './decorators'
import { SignUpDto } from './dto'
import { LocalGuard } from './guards'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto)
  }

  @UseGuards(LocalGuard) // this guard is responsible to sign in
  @Post('signin')
  async signin(@GetUser() user: any) {
    return user
  }
}
