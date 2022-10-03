import { PickType } from '@nestjs/mapped-types'

import { UserEntity } from '../../entities'

export class SignInDto extends PickType(UserEntity, ['email', 'password']) {}
