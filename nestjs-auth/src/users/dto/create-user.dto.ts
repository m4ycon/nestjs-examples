import { OmitType } from '@nestjs/mapped-types'
import { UserEntity } from '../entities'

export class CreateUserDto extends OmitType(UserEntity, ['id']) {}
