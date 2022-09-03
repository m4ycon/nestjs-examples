import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import argon2 from 'argon2'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto'
import { UsersServiceInterface } from './interfaces'

@Injectable()
export class UsersService implements UsersServiceInterface {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user
      .create({ data: createUserDto })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002')
            throw new BadRequestException('Email is already in use')
        }
      })
    return user
  }

  async findAll() {
    const users = await this.prisma.user.findMany()
    return users
  }

  async findOne(id: number) {
    const user = await this.prisma.user
      .findUniqueOrThrow({ where: { id } })
      .catch(() => {
        throw new NotFoundException('User not found')
      })
    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user
      .update({ where: { id }, data: updateUserDto })
      .catch((e) => this.prisma._exceptionNotFound(e, 'User'))

    return user
  }

  async hashPassword(password: string): Promise<string> {
    const hash = await argon2.hash(password)
    return hash
  }
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    const matches = await argon2.verify(hash, password)
    return matches
  }
}
