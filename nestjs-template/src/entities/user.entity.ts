import { User } from '@prisma/client'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class UserEntity implements User {
  @IsNumber()
  @IsNotEmpty()
  id: number
}
