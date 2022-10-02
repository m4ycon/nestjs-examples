import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from './prisma.service'

describe('PrismaService', () => {
  let service: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile()

    service = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('_exceptionNotFound', () => {
    it('should return an instance of NotFoundException', () => {
      const response = service._exceptionNotFound(
        new PrismaClientKnownRequestError('', 'P2025', ''),
        'User',
      )

      expect(response).toBeInstanceOf(NotFoundException)
      expect(response.message).toBe('User not found')
    })

    it('should return an instance of BadRequestException', () => {
      const response = service._exceptionNotFound(
        new PrismaClientKnownRequestError('', 'P2000', ''),
        'User',
      )

      expect(response).toBeInstanceOf(BadRequestException)
      expect(response.message).toBe('Something went wrong')
    })
  })
})
