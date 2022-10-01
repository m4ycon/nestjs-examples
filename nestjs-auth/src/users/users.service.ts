import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto'
import { UsersServiceInterface } from './interfaces'
import { EmailOrId } from './types'

@Injectable()
export class UsersService implements UsersServiceInterface {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user
      .create({
        data: createUserDto,
        select: { id: true, displayName: true, email: true },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002')
            throw new BadRequestException('Email is already in use')
        }
        throw new BadRequestException('Something went wrong')
      })

    return user
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, displayName: true, email: true },
    })
    return users
  }

  async findOne(id: number) {
    const user = await this.prisma.user
      .findUniqueOrThrow({
        where: { id },
        select: { id: true, displayName: true, email: true },
      })
      .catch(() => {
        throw new NotFoundException('User not found')
      })
    return user
  }

  getUserInfo(userIdentifier: EmailOrId): Promise<User> {
    return this.prisma.user.findUnique({
      where: userIdentifier,
    })
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user
      .update({
        where: { id },
        data: updateUserDto,
        select: { id: true, displayName: true, email: true },
      })
      .catch((e) => {
        throw this.prisma._exceptionNotFound(e, 'User')
      })

    return user
  }

  async updateHashedRefreshToken(
    userId: number,
    hashedRefreshToken: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hashedRefreshToken },
    })
  }
}
