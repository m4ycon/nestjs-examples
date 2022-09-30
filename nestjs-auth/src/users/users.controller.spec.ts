import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mock, mockReset } from 'jest-mock-extended'
import * as request from 'supertest'

import { PrismaModule } from '../prisma/prisma.module'
import { TestUtils } from '../utils'
import { UserEntity } from './entities'
import { UsersServiceInterface } from './interfaces'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let app: INestApplication

  const usersServiceMock = mock<UsersServiceInterface>()

  beforeEach(async () => {
    mockReset(usersServiceMock)
  })

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('should be defined', () => {
    expect(app).toBeDefined()
  })

  describe('findAll', () => {
    let userData: Omit<UserEntity, 'id'>
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
    let userData: Omit<UserEntity, 'id'>
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
    let userData: Omit<UserEntity, 'id'>
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
})
