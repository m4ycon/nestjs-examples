import { User } from '@prisma/client'
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class UserEntity implements User {
  @IsNumber()
  id: number

  @IsOptional()
  @IsString()
  displayName: string | null

  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}
