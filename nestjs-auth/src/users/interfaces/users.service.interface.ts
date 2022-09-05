import { User } from '@prisma/client'

import { CreateUserDto, UpdateUserDto } from '../dto'

type UserWithoutPass = Omit<User, 'password'>

export interface UsersServiceInterface {
  /**
   * Creates an User
   * @param createUserDto Data to create a user
   * @returns Returns user created
   */
  create(createUserDto: CreateUserDto): Promise<void | UserWithoutPass>

  /**
   * Find all users in database
   */
  findAll(): Promise<UserWithoutPass[]>

  /**
   * Finds user with this id
   * @param id Id from the user
   */
  findOne(id: number): Promise<UserWithoutPass>

  /**
   * Finds user with this email
   * @param email Email from the user
   */
  findByEmail(email: string): Promise<User>

  /**
   * Updates an user
   * @param id Id from the user
   * @param updateUserDto Data to be updated in database
   */
  update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<void | UserWithoutPass>

  /**
   * Encrypts an string
   * @param password Raw password to be encrypted
   * @returns Returns password encrypted
   */
  hashPassword(password: string): Promise<string>

  /**
   * @param password Raw password
   * @param hash Encrypted password
   * @returns Returns if password matches with hash
   */
  comparePasswords(password: string, hash: string): Promise<boolean>
}
