import { faker } from '@faker-js/faker'

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
      id: parseInt(faker.random.numeric(5)),
    }
  },
}
