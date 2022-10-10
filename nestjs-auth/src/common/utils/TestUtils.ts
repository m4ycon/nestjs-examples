import { faker } from '@faker-js/faker'

import { Tokens } from '../../auth/types'
import { UserEntity } from '../../entities'

/**
 * Test utils
 * @description Useful methods for testing
 */
export const TestUtils = {
  /**
   * Generates a random user
   * @returns A random user, according to the User entity
   */
  genUser(): UserEntity {
    return {
      id: parseInt(faker.random.numeric(3)),
      email: faker.helpers.unique(faker.internet.email),
      password: faker.internet.password(),
      hashedRt: faker.internet.password(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }
  },

  /**
   * Generates random auth tokens
   * @returns Access and refresh tokens
   */
  genTokens(): Tokens {
    return {
      accessToken: faker.internet.password(),
      refreshToken: faker.internet.password(),
    }
  },
}
