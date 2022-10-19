import { User } from '@prisma/client'

import { CreateExampleDto } from '../dto'

// Those comments in /** */
// are used to generate documentation using JSDoc
// when you hover over the function name in your IDE
// you will see the description of the function

export interface ExampleServiceInterface {
  /**
   * Create a new user
   * @param createExampleDto Data needed to create a user
   */
  create(createExampleDto: CreateExampleDto): Promise<User>

  /**
   * Find a user by ID
   * @param id ID of the user
   */
  findOne(id: number): Promise<User>
}
