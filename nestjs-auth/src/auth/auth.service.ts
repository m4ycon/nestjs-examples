import { Injectable, UnauthorizedException } from '@nestjs/common'

import { UsersService } from '../users/users.service'
import { SignInDto, SignUpDto } from './dto'
import { AuthServiceInterface } from './interfaces'

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(private usersService: UsersService) {}

  async signup(signUpDto: SignUpDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirmation, ...userData } = signUpDto

    const user = await this.usersService.create(userData)
    return user
  }

  async signin(signInDto: SignInDto) {
    const { email, password } = signInDto
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const passMatches = await this.usersService.comparePasswords(
      password,
      user.password,
    )
    if (!passMatches) throw new UnauthorizedException('Invalid credentials')

    return { id: user.id, email: user.email }
  }
}
