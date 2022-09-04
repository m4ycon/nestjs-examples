import { PickType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString } from 'class-validator'
import { UserEntity } from 'src/users/entities'
import { Match } from 'src/common'

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
