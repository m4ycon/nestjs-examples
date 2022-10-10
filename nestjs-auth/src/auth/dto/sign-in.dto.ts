import { PickType } from '@nestjs/swagger'

import { UserEntity } from '../../entities'

export class SignInDto extends PickType(UserEntity, ['email', 'password']) {}
