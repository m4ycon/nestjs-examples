import { PickType } from '@nestjs/mapped-types'
import { UserEntity } from 'src/users/entities'

export class SignInDto extends PickType(UserEntity, ['email', 'password']) {}