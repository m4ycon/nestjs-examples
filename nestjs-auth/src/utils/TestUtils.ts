import { faker } from '@faker-js/faker'

import { UserEntity } from '../users/entities'

export class TestUtils {
  static genUser(): Pick<UserEntity, 'displayName' | 'email' | 'password'> {
    return {
      displayName: faker.name.firstName(),
      email: faker.helpers.unique(faker.internet.email),
      password: faker.internet.password(),
    }
  }
}
