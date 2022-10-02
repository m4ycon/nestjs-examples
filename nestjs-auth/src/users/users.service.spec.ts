import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { TestUtils } from '../common'
import { PrismaModule } from '../prisma/prisma.module'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from './users.service'

type UserProps = Pick<User, 'displayName' | 'email' | 'password'>

describe('UsersService', () => {
  let service: UsersService
  const prismaMock = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    _exceptionNotFound: jest.fn(),
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
    let userData: UserProps
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
        new PrismaClientKnownRequestError('', 'P2002', ''),
      )

      await expect(service.create(userData)).rejects.toBeInstanceOf(
        new BadRequestException('Email is already in use').constructor,
      )
    })

    it('should throw an unexpected error in prisma create', async () => {
      prismaMock.user.create.mockRejectedValueOnce(
        new Error('Unexpected error'),
      )

      await expect(service.create(userData)).rejects.toBeInstanceOf(
        new BadRequestException('Something went wrong').constructor,
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
    let userData: UserProps
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
    let userData: UserProps
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

  describe('getUserInfo', () => {
    let userData: UserProps
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should return a user found by email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(userData)

      const response = await service.getUserInfo({ email: userData.email })
      expect(response).toMatchObject(userData)
      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
        where: { email: userData.email },
      })
    })

    it('should return a user found by id', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(userData)

      const response = await service.getUserInfo({ id: 777 })
      expect(response).toMatchObject(userData)
      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
        where: { id: 777 },
      })
    })
  })

  describe('update', () => {
    let userData: UserProps
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should return a user', async () => {
      prismaMock.user.update.mockResolvedValueOnce(userData)

      const response = await service.update(1, userData)
      expect(response).toMatchObject(userData)
      expect(prismaMock.user.update).toHaveBeenLastCalledWith({
        where: { id: 1 },
        data: userData,
        select: { id: true, displayName: true, email: true },
      })
    })

    it('should throw an error if user not found', async () => {
      prismaMock.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError('', 'P2025', ''),
      )
      prismaMock._exceptionNotFound.mockReturnValueOnce(
        new NotFoundException('User not found'),
      )

      await expect(service.update(1, userData)).rejects.toBeInstanceOf(
        new NotFoundException('User not found').constructor,
      )
      expect(prismaMock._exceptionNotFound).toHaveBeenCalled()
    })
  })

  describe('updateHashedRefreshToken', () => {
    let userData: UserProps
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should update rt from a user', async () => {
      prismaMock.user.update.mockResolvedValueOnce(userData)

      const response = await service.updateHashedRefreshToken(1, 'token')
      expect(response).toBeUndefined()
      expect(prismaMock.user.update).toHaveBeenLastCalledWith({
        where: { id: 1 },
        data: { hashedRt: 'token' },
      })
    })

    it('should updateMany if rt param is null', async () => {
      prismaMock.user.updateMany.mockResolvedValueOnce(userData)

      const response = await service.updateHashedRefreshToken(1, null)
      expect(response).toBeUndefined()
      expect(prismaMock.user.updateMany).toHaveBeenLastCalledWith({
        where: { id: 1, NOT: { hashedRt: null } },
        data: { hashedRt: null },
      })
    })
  })
})
