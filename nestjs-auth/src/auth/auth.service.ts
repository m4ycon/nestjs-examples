import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { SignUpDto, SignInDto } from './dto'
import { AuthServiceInterface } from './interfaces'

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(private usersService: UsersService) {}

  async signup(signUpDto: SignUpDto): Promise<{ accessToken: string }> {
    const { passwordConfirmation, ...userData } = signUpDto
    if (passwordConfirmation != userData.password)
      throw new BadRequestException("Passwords doesn't match")

    await this.usersService.create(userData)

    return { accessToken: 'oi' }
  }

  async signin(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const passMatches = await this.usersService.comparePasswords(
      password,
      user.password,
    )
    if (!passMatches) throw new UnauthorizedException('Invalid credentials')

    return { accessToken: 'oi' }
  }
}
