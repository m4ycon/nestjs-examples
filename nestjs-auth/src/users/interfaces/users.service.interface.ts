import { User } from '@prisma/client'

import { CreateUserDto, UpdateUserDto } from '../dto'
import { EmailOrId } from '../types'

type UserProps = Pick<User, 'id' | 'displayName' | 'email'>

export interface UsersServiceInterface {
  /**
   * Creates an User
   * @param createUserDto Data to create a user
   * @returns Returns user created
   */
  create(createUserDto: CreateUserDto): Promise<UserProps>

  /**
   * Find all users in database
   */
  findAll(): Promise<UserProps[]>

  /**
   * Finds user with this id
   * @param id Id from the user
   */
  findOne(id: number): Promise<UserProps>

  /**
   * Finds user and returns all its data
   * @param userIdentifier Email or id from the user
   */
  getUserInfo(userIdentifier: EmailOrId): Promise<User>

  /**
   * Updates an user
   * @param id Id from the user
   * @param updateUserDto Data to be updated in database
   */
  update(id: number, updateUserDto: UpdateUserDto): Promise<void | UserProps>

  /**
   * Updates user refresh token
   * @param userId Id from the user
   * @param hashedRefreshToken Refresh token encrypted
   */
  updateHashedRefreshToken(
    userId: number,
    hashedRefreshToken: string,
  ): Promise<void>
}
