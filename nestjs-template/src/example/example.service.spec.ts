import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'

import { TestUtils } from '../common/utils'
import { UserEntity } from '../entities'
import { PrismaService } from '../prisma/prisma.service'
import { ExampleService } from './example.service'

describe('ExampleService', () => {
  let user: UserEntity
  let service: ExampleService

  const prismaMock = mock({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  })

  beforeEach(async () => {
    user = TestUtils.genUser()
    jest.restoreAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<ExampleService>(ExampleService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    beforeEach(() => {
      prismaMock.user.create.mockResolvedValue(user)
    })

    it('should return the user created', async () => {
      const response = await service.create(user)
      expect(response).toEqual(user)
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: user,
      })
    })

    it('should throw an exception if fails on creating an user', async () => {
      prismaMock.user.create.mockRejectedValue(new Error('Error'))

      await expect(service.create(user)).rejects.toThrowError(
        new BadRequestException('Something went wrong while creating user'),
      )
    })
  })

  describe('findOne', () => {
    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(user)
    })

    it('should return an user', async () => {
      const response = await service.findOne(user.id)
      expect(response).toEqual(user)
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      })
    })

    it('should throw an exception if user was not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(undefined)

      await expect(service.findOne(user.id)).rejects.toThrowError(
        new NotFoundException(`User with ID ${user.id} not found`),
      )
    })
  })
})
