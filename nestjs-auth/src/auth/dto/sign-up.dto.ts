import { PickType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString } from 'class-validator'

import { Match } from '../../common'
import { UserEntity } from '../../users/entities'

export class SignUpDto extends PickType(UserEntity, [
  'email',
  'password',
  'displayName',
]) {
  @IsNotEmpty()
  @IsString()
  @Match('password')
  passwordConfirmation: string
}
