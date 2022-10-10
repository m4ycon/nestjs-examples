import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { mock, mockReset } from 'jest-mock-extended'

import { AtGuard } from '../auth/guards'
import { AtStrategy } from '../auth/strategies'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let app: INestApplication

  const usersServiceMock = mock<UsersService>()

  beforeEach(async () => {
    mockReset(usersServiceMock)
    jest.restoreAllMocks()
  })

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      controllers: [UsersController],
      providers: [
        AtStrategy,
        { provide: UsersService, useValue: usersServiceMock },
        {
          provide: APP_GUARD,
          useClass: AtGuard,
        },
      ],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('should be defined', () => {
    expect(app).toBeDefined()
  })
})
