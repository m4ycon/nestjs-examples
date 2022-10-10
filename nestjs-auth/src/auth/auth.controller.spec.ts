import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { mock, mockReset } from 'jest-mock-extended'
import * as request from 'supertest'

import { TestUtils } from '../common/utils'
import { UserEntity } from '../entities'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AtGuard, RtGuard } from './guards'
import { AtStrategy } from './strategies'
import { Tokens } from './types'

type UserProps = Pick<UserEntity, 'email' | 'password'>

describe('AuthController', () => {
  let app: INestApplication
  let userData: UserProps
  let userDataFull: UserEntity
  let tokensData: Tokens

  const rtGuardMock = { canActivate: jest.fn() }

  const authServiceMock = mock<AuthService>()

  beforeEach(async () => {
    mockReset(authServiceMock)
    jest.restoreAllMocks()

    tokensData = TestUtils.genTokens()
    userDataFull = TestUtils.genUser()
    userData = {
      email: userDataFull.email,
      password: userDataFull.password,
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [AuthController],
      providers: [
        AtStrategy,
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: APP_GUARD,
          useClass: AtGuard,
        },
      ],
    })
      .overrideGuard(RtGuard)
      .useValue(rtGuardMock)
      .compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('should be defined', () => {
    expect(app).toBeDefined()
  })

  describe('signup', () => {
    beforeEach(() => {
      authServiceMock.signup.mockResolvedValueOnce(tokensData)
    })

    it('should return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...userData, passwordConfirmation: userData.password })
        .expect(201)
      expect(response.body).toEqual({ message: 'Sign up successfully' })
    })

    it.each([
      [
        'should return 400 as body is missing email',
        {
          password: '123456',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as body is missing password',
        {
          email: 'test@test.com',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as body is missing passwordConfirmation',
        {
          email: 'test@test.com',
          password: '123456',
        },
      ],
      [
        "should return 400 as password and passwordConfirmation don't match",
        {
          email: 'test@test.com',
          password: '12345',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as email is invalid',
        {
          email: 'test',
          password: '12345',
          passwordConfirmation: '123456',
        },
      ],
      [
        'should return 400 as password is too short',
        {
          email: 'test',
          password: '12345',
          passwordConfirmation: '12345',
        },
      ],
    ])('%s', async (message, requestInput) => {
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
    beforeEach(() => {
      authServiceMock.signin.mockResolvedValueOnce(tokensData)
    })

    it('should return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: userData.email, password: userData.password })
        .expect(200)
      expect(response.body).toEqual({ message: 'Sign in successfully' })
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

  describe('signout', () => {
    let canActivateAtGuard: jest.SpyInstance

    beforeEach(() => {
      canActivateAtGuard = jest.spyOn(AtGuard.prototype, 'canActivate')
    })

    it('should return a successs message', async () => {
      canActivateAtGuard.mockImplementationOnce((ctx) => {
        ctx.switchToHttp().getRequest().user = { id: userDataFull.id }
        return true
      })

      authServiceMock.signout.mockResolvedValueOnce()

      await request(app.getHttpServer())
        .post('/auth/signout')
        .expect(200)
        .expect({ message: 'Sign out successfully' })
      expect(authServiceMock.signout).toHaveBeenLastCalledWith(userDataFull.id)
    })

    it('should return 403', async () => {
      canActivateAtGuard.mockResolvedValueOnce(false)

      await request(app.getHttpServer()).post('/auth/signout').expect(403)
    })
  })

  describe('refresh', () => {
    describe('when refresh token is valid', () => {
      beforeEach(() => {
        rtGuardMock.canActivate.mockImplementation((ctx) => {
          ctx.switchToHttp().getRequest().user = {
            userId: userDataFull.id,
            refreshToken: tokensData.refreshToken,
          }
          return true
        })
        authServiceMock.refresh.mockResolvedValueOnce(tokensData)
      })

      it('should return tokens', async () => {
        await request(app.getHttpServer())
          .post('/auth/refresh')
          .expect(200)
          .expect({ message: 'Refresh successfully' })
        expect(authServiceMock.refresh).toHaveBeenLastCalledWith(
          userDataFull.id,
          tokensData.refreshToken,
        )
      })

      it('should set tokens on cookies', async () => {
        await request(app.getHttpServer())
          .post('/auth/refresh')
          .expect(200)
          .expect({ message: 'Refresh successfully' })

        expect(authServiceMock.setAuthCookies).toHaveBeenLastCalledWith(
          expect.any(Object),
          tokensData,
        )
      })
    })

    it('should return 403 if refresh token is invalid', async () => {
      rtGuardMock.canActivate.mockResolvedValueOnce(false)

      await request(app.getHttpServer()).post('/auth/refresh').expect(403)
    })
  })
})
