import { PickType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString } from 'class-validator'
import { UserEntity } from 'src/users/entities'

export class SignUpDto extends PickType(UserEntity, [
  'email',
  'password',
  'displayName',
]) {
  @IsNotEmpty()
  @IsString()
  passwordConfirmation: string
}
