import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { mock, mockReset } from 'jest-mock-extended'
import * as request from 'supertest'

import { AuthenticatedGuard } from '../auth/guards'
import { TestUtils } from '../common'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersServiceInterface } from './interfaces'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

type UserProps = Pick<User, 'displayName' | 'email' | 'password'>

describe('UsersController', () => {
  let app: INestApplication

  const usersServiceMock = mock<UsersServiceInterface>()
  const authGuardMock = mock<AuthenticatedGuard>()

  beforeEach(async () => {
    mockReset(usersServiceMock)
  })

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    })
      .overrideGuard(AuthenticatedGuard)
      .useValue(authGuardMock)
      .compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('should be defined', () => {
    expect(app).toBeDefined()
  })

  describe('findAll', () => {
    let userData: UserProps
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should return an array of users', async () => {
      const expectedResponse = [{ id: 1, ...userData }]
      usersServiceMock.findAll.mockResolvedValueOnce(expectedResponse)

      await request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('findOne', () => {
    let userData: UserProps
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should return one user', async () => {
      const expectedResponse = { id: 1, ...userData }
      usersServiceMock.findOne.mockResolvedValueOnce(expectedResponse)

      await request(app.getHttpServer())
        .get(`/users/${expectedResponse.id}`)
        .expect(200)
        .expect(expectedResponse)
      expect(usersServiceMock.findOne).toHaveBeenLastCalledWith(
        expectedResponse.id,
      )
    })
  })

  describe('update', () => {
    let userData: UserProps
    beforeAll(() => {
      userData = TestUtils.genUser()
    })

    it('should return one user', async () => {
      const expectedResponse = { id: 1, ...userData }
      const updateUserDto = { displayName: 'new name' }
      usersServiceMock.update.mockResolvedValueOnce(expectedResponse)

      await request(app.getHttpServer())
        .patch(`/users/${expectedResponse.id}`)
        .send(updateUserDto)
        .expect(200)
        .expect(expectedResponse)
      expect(usersServiceMock.update).toHaveBeenLastCalledWith(
        expectedResponse.id,
        updateUserDto,
      )
    })

    it.each([
      { displayName: 0, email: '', password: '' },
      { displayName: '', email: 0, password: '' },
      { displayName: '', email: '', password: 0 },
    ])('should return 400 if data is invalid', async (updateUserDto) => {
      const expectedResponse = { id: 1, ...userData }
      usersServiceMock.update.mockResolvedValueOnce(expectedResponse)

      await request(app.getHttpServer())
        .patch(`/users/${expectedResponse.id}`)
        .send(updateUserDto)
        .expect(400)
        .expect((res) => {
          const body = res.body
          expect(body.statusCode).toBe(400)
          expect(body.message).toEqual(expect.any(Array))
          expect(body.error).toBe('Bad Request')
        })
      expect(usersServiceMock.update).not.toHaveBeenCalled()
    })
  })

  describe('me', () => {
    it('should return unauthorized', async () => {
      authGuardMock.canActivate.mockImplementationOnce(async () => {
        throw new UnauthorizedException()
      })

      await request(app.getHttpServer()).get(`/users/me`).expect(401)
    })

    it('should return user', async () => {
      authGuardMock.canActivate.mockResolvedValueOnce(true)

      // expect '' because we are not mocking the request.user
      await request(app.getHttpServer()).get(`/users/me`).expect(200).expect('')
    })
  })
})
