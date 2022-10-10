import { UserEntity } from '../../entities'
import { CreateUserDto } from '../dto'

export interface UsersServiceInterface {
  /**
   * Creates a new user
   * @param createUserDto Data to create a new user
   * @returns The created user
   */
  create(
    createUserDto: CreateUserDto,
  ): Promise<Pick<UserEntity, 'email' | 'id'>>

  /**
   * Finds a user by id or email
   * @param where Id or email of the user
   * @returns The user or undefined if not found
   */
  findOne(where: {
    id?: number
    email?: string
  }): Promise<UserEntity | undefined>

  /**
   * Updates the hashed refresh token of a user
   * @param userId Id of the user
   * @param hashedToken Hashed refresh token
   */
  updateHashedRefreshToken(
    userId: number,
    hashedToken: string | null,
  ): Promise<void>
}
