import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { CreateExampleDto } from './dto'
import { ExampleServiceInterface } from './interfaces'

@Injectable()
export class ExampleService implements ExampleServiceInterface {
  constructor(private prisma: PrismaService) {}

  async create(createExampleDto: CreateExampleDto) {
    const user = await this.prisma.user
      .create({
        data: createExampleDto,
      })
      .catch(() => {
        throw new BadRequestException(
          'Something went wrong while creating user',
        )
      })

    return user
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) throw new NotFoundException(`User with ID ${id} not found`)

    return user
  }
}
