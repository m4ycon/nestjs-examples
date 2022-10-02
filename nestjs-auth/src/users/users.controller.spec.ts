import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { mock, mockReset } from 'jest-mock-extended'
import * as request from 'supertest'

import { AtGuard } from '../auth/guards'
import { AtStrategy } from '../auth/strategies'
import { TestUtils } from '../common'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersServiceInterface } from './interfaces'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

type UserProps = Pick<User, 'displayName' | 'email' | 'password'>

describe('UsersController', () => {
  let app: INestApplication

  const usersServiceMock = mock<UsersServiceInterface>()

  beforeEach(async () => {
    mockReset(usersServiceMock)
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

  describe('findAll', () => {
    let userData: UserProps
    beforeEach(() => {
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
    beforeEach(() => {
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
    beforeEach(() => {
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
    it('should return forbidden', async () => {
      jest.spyOn(AtGuard.prototype, 'canActivate').mockResolvedValueOnce(false)

      await request(app.getHttpServer()).get(`/users/me`).expect(403)
    })

    it('should return user', async () => {
      jest.spyOn(AtGuard.prototype, 'canActivate').mockResolvedValueOnce(true)
      // expect '' because we are not mocking the request.user
      await request(app.getHttpServer()).get(`/users/me`).expect(200).expect('')
    })
  })
})
