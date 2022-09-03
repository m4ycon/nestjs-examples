import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto'
import { UsersServiceInterface } from './interfaces'

@Injectable()
export class UsersService implements UsersServiceInterface {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hash = await this.hashPassword(createUserDto.password)

    const user = await this.prisma.user
      .create({
        data: { ...createUserDto, password: hash },
        select: { id: true, displayName: true, email: true },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002')
            throw new BadRequestException('Email is already in use')
        }
      })

    return user
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      // select: { id: true, displayName: true, email: true },
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

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user
      .update({
        where: { id },
        data: updateUserDto,
        select: { id: true, displayName: true, email: true },
      })
      .catch((e) => this.prisma._exceptionNotFound(e, 'User'))

    return user
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    return hash
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    const matches = await bcrypt.compare(password, hash)
    return matches
  }
}
