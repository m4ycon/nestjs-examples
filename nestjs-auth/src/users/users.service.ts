import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { UserEntity } from '../entities'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto'
import { UsersServiceInterface } from './interfaces'

@Injectable()
export class UsersService implements UsersServiceInterface {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Pick<UserEntity, 'email' | 'id'>> {
    return this.prisma.user
      .create({
        data: createUserDto,
        select: { id: true, email: true },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002')
            throw new BadRequestException('Email already in use')
        }
        throw e
      })
  }

  async findOne(where: {
    id?: number
    email?: string
  }): Promise<UserEntity | undefined> {
    if (!where.id && !where.email) throw new Error('Missing where argument')

    const user = await this.prisma.user.findUnique({ where })
    return user
  }

  async updateHashedRefreshToken(
    userId: number,
    hashedToken: string | null,
  ): Promise<void> {
    if (!hashedToken) {
      // delete the hashedRefreshToken
      // this avoids a user spamming the database with null values
      await this.prisma.user.updateMany({
        where: { id: userId, hashedRt: { not: null } },
        data: { hashedRt: null },
      })
      return
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hashedToken },
    })
    return
  }
}
