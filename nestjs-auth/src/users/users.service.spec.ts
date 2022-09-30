import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaModule } from '../prisma/prisma.module'
import { PrismaService } from '../prisma/prisma.service'
import { TestUtils } from '../utils'
import { UserEntity } from './entities'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  const prismaMock = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [UsersService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    let userData: Omit<UserEntity, 'id'>
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should create a user', async () => {
      prismaMock.user.create.mockResolvedValueOnce(userData)

      const response = await service.create(userData)
      expect(response).toMatchObject({
        ...userData,
        password: expect.any(String),
      })
    })

    it('should throw an error if email is already in use', async () => {
      prismaMock.user.create.mockRejectedValueOnce(
        new PrismaClientKnownRequestError(
          'Email is already in use',
          'P2002',
          '4.2.1',
        ),
      )

      await expect(service.create(userData)).rejects.toBeInstanceOf(
        new BadRequestException('Email is already in use').constructor,
      )
    })

    it("should not return user's password", async () => {
      prismaMock.user.create.mockResolvedValueOnce(userData)

      await service.create(userData)
      expect(prismaMock.user.create).toHaveBeenLastCalledWith({
        data: {
          ...userData,
          password: expect.any(String),
        },
        select: {
          id: true,
          displayName: true,
          email: true,
          // password must not be returned
        },
      })
    })
  })

  describe('findAll', () => {
    let userData: Omit<UserEntity, 'id'>
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should return an array of users', async () => {
      prismaMock.user.findMany.mockResolvedValueOnce([userData])

      const response = await service.findAll()
      expect(response).toMatchObject([userData])
    })

    it('should not return password of users', async () => {
      prismaMock.user.findMany.mockResolvedValueOnce([userData])
      await service.findAll()

      expect(prismaMock.user.findMany).toHaveBeenLastCalledWith({
        select: {
          id: true,
          displayName: true,
          email: true,
          // password must not be returned
        },
      })
    })
  })

  describe('findOne', () => {
    let userData: Omit<UserEntity, 'id'>
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should return a user', async () => {
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(userData)

      const response = await service.findOne(1)
      expect(response).toMatchObject(userData)
      expect(prismaMock.user.findUniqueOrThrow).toHaveBeenLastCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          displayName: true,
          email: true,
          // password must not be returned
        },
      })
    })

    it('should throw an error if user is not found', async () => {
      prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(new Error())

      await expect(service.findOne(1)).rejects.toBeInstanceOf(
        new NotFoundException('User not found').constructor,
      )
    })
  })
})
