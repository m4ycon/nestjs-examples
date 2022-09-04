import { User } from '@prisma/client'
import { SignInDto, SignUpDto } from '../dto'

export interface AuthServiceInterface {
  /**
   * Register a valid user in the database
   * @param signUpDto Data needed to sign up user
   */
  signup(signUpDto: SignUpDto): Promise<void | Omit<User, 'password'>>

  /**
   * Login user if the credentials are valid
   * @param signInDto Email and password to sign in
   */
  signin(signInDto: SignInDto): Promise<Pick<User, 'id' | 'email'>>
}
