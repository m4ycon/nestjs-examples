import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { mock, mockReset } from 'jest-mock-extended'

import { TestUtils } from '../common/utils'
import { UserEntity } from '../entities'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let userData: UserEntity

  const prismaMock = mock({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  })

  beforeEach(() => {
    mockReset(prismaMock)
    jest.restoreAllMocks()
    userData = TestUtils.genUser()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a user', async () => {
      prismaMock.user.create.mockResolvedValue(userData)

      const result = await service.create(userData)
      expect(result).toEqual(userData)
      expect(prismaMock.user.create).toBeCalledWith({
        data: userData,
        select: { id: true, email: true },
      })
    })

    it('should throw an exception if email is already in use', async () => {
      prismaMock.user.create.mockRejectedValue(
        new PrismaClientKnownRequestError('', 'P2002', ''),
      )

      await expect(service.create(userData)).rejects.toThrowError(
        new BadRequestException('Email already in use'),
      )
    })

    it('should throw an error if the database throws an unhandled error', async () => {
      prismaMock.user.create.mockRejectedValue(new Error())

      await expect(service.create(userData)).rejects.toThrowError(Error)
    })
  })

  describe('findOne', () => {
    it('should return a user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userData)

      const response = await service.findOne({ id: userData.id })
      expect(response).toEqual(userData)
    })

    it('should find a user by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userData)

      await service.findOne({ id: userData.id })
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { id: userData.id },
      })
    })

    it('should find a user by email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userData)

      await service.findOne({ email: userData.email })
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { email: userData.email },
      })
    })

    it('should return null if no user is found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const response = await service.findOne({ id: userData.id })
      expect(response).toBeNull()
    })

    it('should throw an error if no where argument is provided', async () => {
      await expect(service.findOne({})).rejects.toThrowError(
        new Error('Missing where argument'),
      )
    })
  })

  describe('updateHashedRefreshToken', () => {
    it('should update the hashed refresh token', async () => {
      prismaMock.user.update.mockResolvedValue(userData)

      await service.updateHashedRefreshToken(userData.id, 'hashedToken')
      expect(prismaMock.user.update).toBeCalledWith({
        where: { id: userData.id },
        data: { hashedRt: 'hashedToken' },
      })
    })

    it('should update the hashed refresh token with a null value', async () => {
      prismaMock.user.updateMany.mockResolvedValue(userData)

      await service.updateHashedRefreshToken(userData.id, null)
      expect(prismaMock.user.updateMany).toBeCalledWith({
        where: { id: userData.id, hashedRt: { not: null } },
        data: { hashedRt: null },
      })
    })
  })
})
