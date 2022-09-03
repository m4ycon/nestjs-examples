import { User } from '@prisma/client'
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class UserEntity implements User {
  @IsNotEmpty()
  @IsNumber()
  id: number

  @IsOptional()
  @IsString()
  displayName: string | null

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string
}
