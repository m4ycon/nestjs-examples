import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto'

@Injectable()
export class UsersService {
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
      .catch(this._catchNotFound)
    return user
  }

  async remove(id: number) {
    const user = await this.prisma.user
      .delete({ where: { id } })
      .catch(this._catchNotFound)
    return user
  }

  private _catchNotFound(e: any) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException('User not found')
    }
    throw new Error(e)
  }
}
