import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto })
  }

  findAll() {
    return this.prisma.user.findMany()
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: updateUserDto })
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } })
  }
}
