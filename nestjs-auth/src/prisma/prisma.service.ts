import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

@Injectable()
export class PrismaService extends PrismaClient {
  _exceptionNotFound(e: any, entity: string) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException(`${entity} not found`)
    }
    throw new Error(e)
  }
}
