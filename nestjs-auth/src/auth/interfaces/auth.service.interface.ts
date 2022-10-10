import { Response } from 'express'

import { SignInDto, SignUpDto } from '../dto'
import { Tokens } from '../types'

export interface AuthServiceInterface {
  /**
   * Creates a new user and returns new tokens
   * @param signUpDto Data to create a new user
   * @returns New tokens
   */
  signup(signUpDto: SignUpDto): Promise<Tokens>

  /**
   * Signs in a user and returns new tokens
   * @param signInDto Data needed to sign in
   * @returns New tokens
   */
  signin(signInDto: SignInDto): Promise<Tokens>

  /**
   * Deletes the refresh token of a user stored in db
   * @param userId Id of the user to sign out
   */
  signout(userId: number): Promise<void>

  /**
   * Updates the refresh token of a user and returns new tokens
   * @param userId Id of the user to refresh
   * @param refreshToken Old Refresh token of the user
   */
  refresh(userId: number, refreshToken: string): Promise<Tokens>

  /**
   * Updates the refresh token of a user with a new one and returns new tokens
   * @param userId Id of the user
   * @param email Email of the user
   * @returns New tokens
   */
  updateRtAndGetNewTokens(userId: number, email: string): Promise<Tokens>

  /**
   * Updates the refresh token of a user with a new one
   * @param userId Id of the user
   * @param refreshToken Old refresh token of the user
   */
  updateRefreshToken(userId: number, refreshToken: string): Promise<void>

  /**
   * Generates new tokens for a user and returns them
   * @param userId Id of the user
   * @param email Email of the user
   * @returns New tokens
   */
  signTokens(userId: number, email: string): Promise<Tokens>

  /**
   * Sets the cookies with the tokens
   * @param res Express Response object
   * @param tokens Tokens to set in the cookies
   */
  setAuthCookies(res: Response, tokens: Tokens): void

  /**
   * Clears the cookies with the tokens
   * @param res Express Response object
   */
  clearAuthCookies(res: Response): void

  /**
   * Hashes a string
   * @param data Data to hash
   * @returns Hashed data
   */
  hashData(data: string): Promise<string>

  /**
   * Compares a string with a hash
   * @param data Data to compare
   * @param hash Hash to compare with
   * @returns True if the data matches the hash
   */
  compareHash(data: string, hash: string): Promise<boolean>
}
