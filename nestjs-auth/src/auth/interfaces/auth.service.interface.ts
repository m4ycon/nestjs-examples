import { Request } from 'express'

import { SignInDto, SignUpDto } from '../dto'
import { Tokens } from '../types'

export interface AuthServiceInterface {
  /**
   * Register a valid user in the database
   * @param signUpDto Data needed to sign up user
   */
  signup(signUpDto: SignUpDto): Promise<Tokens>

  /**
   * Login user if the credentials are valid
   * @param signInDto Email and password to sign in
   */
  signin(signInDto: SignInDto): Promise<Tokens>

  /**
   * Refresh the session of the user
   * @param request Request object coming from the client
   */
  refresh(request: Request): Promise<Tokens>

  /**
   * Hash a string
   * @param data Data to be encrypted
   */
  hashData(data: string): Promise<string>
}
