import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignInDto, SignUpDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto)
  }

  @Post('signin')
  async signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto)
  }
}
