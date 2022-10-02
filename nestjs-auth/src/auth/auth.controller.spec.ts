import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { mock, mockReset } from 'jest-mock-extended'
import * as request from 'supertest'

import { TestUtils } from '../common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

type UserProps = Pick<User, 'displayName' | 'email' | 'password'>

describe('AuthController', () => {
  let app: INestApplication
  let userData: UserProps
  // let userDataFull: User

  const authServiceMock = mock<AuthService>()

  beforeEach(() => {
    mockReset(authServiceMock)
    userData = TestUtils.genUser()
    // userDataFull = {
    //   ...userData,
    //   id: Math.round(Math.random() * 100),
    //   hashedRt: '654564564',
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }
  })

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('should be defined', () => {
    expect(app).toBeDefined()
  })

  describe('signup', () => {
    it('should return tokens', async () => {
      const expectedResponse = { accessToken: '123', refreshToken: '456' }

      authServiceMock.signup.mockResolvedValueOnce(expectedResponse)

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...userData, passwordConfirmation: userData.password })
        .expect(201)
      expect(response.body).toEqual(expectedResponse)
    })

    it.each([
      [
        'should return 400 as body is missing email',
        {
          displayName: 'test',
          password: '123456',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as body is missing password',
        {
          displayName: 'test',
          email: 'test@test.com',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as body is missing passwordConfirmation',
        {
          displayName: 'test',
          email: 'test@test.com',
          password: '123456',
        },
      ],
      [
        "should return 400 as password and passwordConfirmation don't match",
        {
          displayName: 'test',
          email: 'test@test.com',
          password: '12345',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as email is invalid',
        {
          displayName: 'test',
          email: 'test',
          password: '12345',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as password is too short',
        {
          displayName: 'test',
          email: 'test',
          password: '12345',
          passwordConfirmation: '12345',
        },
      ],
    ])('%s', async (message, requestInput) => {
      const expectedResponse = { accessToken: '123', refreshToken: '456' }

      authServiceMock.signup.mockResolvedValueOnce(expectedResponse)

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(requestInput)
        .expect((res) => {
          const body = res.body
          expect(body.statusCode).toBe(400)
          expect(body.message).toEqual(expect.any(Array))
          expect(body.error).toBe('Bad Request')
        })
      expect(authServiceMock.signup).not.toHaveBeenCalled()
    })
  })

  describe('signin', () => {
    it('should return tokens', async () => {
      const expectedResponse = { accessToken: '123', refreshToken: '456' }

      authServiceMock.signin.mockResolvedValueOnce(expectedResponse)

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: userData.email, password: userData.password })
        .expect(200)
      expect(response.body).toEqual(expectedResponse)
    })

    it.each([
      [
        'should return 400 as body is missing email',
        {
          password: '123456',
        },
      ],
      [
        'should return 400 as body is missing password',
        {
          email: 'test@test.com',
        },
      ],
      [
        'should return 400 as email is invalid',
        {
          email: 'test',
          password: '123456',
        },
      ],
    ])('%s', async (message, requestInput) => {
      const expectedResponse = { accessToken: '123', refreshToken: '456' }

      authServiceMock.signin.mockResolvedValueOnce(expectedResponse)

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(requestInput)
        .expect((res) => {
          const body = res.body
          expect(body.statusCode).toBe(400)
          expect(body.message).toEqual(expect.any(Array))
          expect(body.error).toBe('Bad Request')
        })
      expect(authServiceMock.signup).not.toHaveBeenCalled()
    })
  })
})
