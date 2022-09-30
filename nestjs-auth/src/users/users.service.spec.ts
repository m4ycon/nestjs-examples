import { BadRequestException } from '@nestjs/common'
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
})
