import { PickType } from '@nestjs/mapped-types'

import { UserEntity } from '../entities'

export class CreateUserDto extends PickType(UserEntity, [
  'displayName',
  'email',
  'password',
]) {}
