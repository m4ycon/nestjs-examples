import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

import { Match } from '../../common'
import { CreateUserDto } from '../../users/dto'

export class SignUpDto extends CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Match('password')
  passwordConfirmation: string
}
