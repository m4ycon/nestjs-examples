import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mock, mockReset } from 'jest-mock-extended'

import { TestUtils } from '../common/utils'
import { UserEntity } from '../entities'
import { PrismaService } from '../prisma/prisma.service'
import { ExampleService } from './example.service'

describe('ExampleService', () => {
  let userData: UserEntity
  let service: ExampleService

  const prismaMock = mock({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  })

  beforeEach(async () => {
    userData = TestUtils.genUser()
    mockReset(prismaMock)
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
      prismaMock.user.create.mockResolvedValue(userData)
    })

    it('should return the user created', async () => {
      const response = await service.create(userData)
      expect(response).toEqual(userData)
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: userData,
      })
    })

    it('should throw an exception if fails on creating an user', async () => {
      prismaMock.user.create.mockRejectedValue(new Error('Error'))

      await expect(service.create(userData)).rejects.toThrowError(
        new BadRequestException('Something went wrong while creating user'),
      )
    })
  })

  describe('findOne', () => {
    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(userData)
    })

    it('should return an user', async () => {
      const response = await service.findOne(userData.id)
      expect(response).toEqual(userData)
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userData.id },
      })
    })

    it('should throw an exception if user was not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(undefined)

      await expect(service.findOne(userData.id)).rejects.toThrowError(
        new NotFoundException(`User with ID ${userData.id} not found`),
      )
    })
  })
})
