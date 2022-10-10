import { PickType } from '@nestjs/swagger'

import { UserEntity } from '../../entities'

export class CreateUserDto extends PickType(UserEntity, [
  'email',
  'password',
]) {}
