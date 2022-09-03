import { SignInDto, SignUpDto } from '../dto'

type AccessToken = {
  accessToken: string
}

export interface AuthServiceInterface {
  /**
   * Register a valid user in the database
   * @param signUpDto Data needed to sign up user
   */
  signup(signUpDto: SignUpDto): Promise<AccessToken>

  /**
   * Login user if the credentials are valid
   * @param signInDto Email and password to sign in
   */
  signin(signInDto: SignInDto): Promise<AccessToken>
}
