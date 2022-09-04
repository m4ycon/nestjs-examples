import { PickType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString } from 'class-validator'
import { UserEntity } from '../../users/entities'
import { Match } from '../../common'

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
