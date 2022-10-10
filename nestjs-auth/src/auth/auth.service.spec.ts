import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as argon2 from 'argon2'
import { mock, mockReset } from 'jest-mock-extended'

import { TestUtils } from '../common/utils'
import { UserEntity } from '../entities'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { Tokens } from './types'

describe('AuthService', () => {
  let service: AuthService
  let config: ConfigService
  let userData: UserEntity
  let tokensData: Tokens

  const usersServiceMock = mock<UsersService>()
  const jwtServiceMock = mock<JwtService>()
  const argon2Mock = mock({
    hash: jest.fn(),
    verify: jest.fn(),
  })

  beforeEach(() => {
    userData = TestUtils.genUser()
    tokensData = TestUtils.genTokens()

    mockReset(usersServiceMock)
    mockReset(jwtServiceMock)
    mockReset(argon2Mock)

    Object.keys(argon2Mock).forEach((key) => {
      ;(argon2[key] as jest.Mock) = argon2Mock[key]
    })

    jest.restoreAllMocks()
  })

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    config = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signup', () => {
    let hashData: jest.SpyInstance
    let updateRtAndGetNewTokens: jest.SpyInstance

    beforeEach(() => {
      hashData = jest.spyOn(service, 'hashData')
      updateRtAndGetNewTokens = jest.spyOn(service, 'updateRtAndGetNewTokens')
      usersServiceMock.create.mockResolvedValue(userData)
      hashData.mockResolvedValue('hash-password')
      updateRtAndGetNewTokens.mockResolvedValue(tokensData)
    })

    it('should return new auth tokens', async () => {
      const result = await service.signup({
        email: userData.email,
        password: userData.password,
        passwordConfirmation: userData.password,
      })

      expect(result).toMatchObject(tokensData)

      expect(usersServiceMock.create).toBeCalledTimes(1)
      expect(hashData).toBeCalledTimes(1)
      expect(updateRtAndGetNewTokens).toBeCalledTimes(1)
    })

    it('should create a new user with hashed password', async () => {
      const result = await service.signup({
        email: userData.email,
        password: userData.password,
        passwordConfirmation: userData.password,
      })

      expect(result).toMatchObject(tokensData)

      expect(usersServiceMock.create).toBeCalledTimes(1)
      expect(usersServiceMock.create).toBeCalledWith({
        email: userData.email,
        password: 'hash-password',
      })
    })
  })

  describe('signin', () => {
    let compareHash: jest.SpyInstance
    let updateRtAndGetNewTokens: jest.SpyInstance

    beforeEach(() => {
      compareHash = jest.spyOn(service, 'compareHash')
      updateRtAndGetNewTokens = jest.spyOn(service, 'updateRtAndGetNewTokens')
      usersServiceMock.findOne.mockResolvedValue(userData)
      compareHash.mockResolvedValue(true)
    })

    it('should sign in a user', async () => {
      updateRtAndGetNewTokens.mockResolvedValue(tokensData)

      const result = await service.signin({
        email: userData.email,
        password: userData.password,
      })

      expect(result).toMatchObject(tokensData)

      expect(compareHash).toBeCalledTimes(1)
      expect(updateRtAndGetNewTokens).toBeCalledTimes(1)
      expect(usersServiceMock.findOne).toBeCalledTimes(1)
      expect(usersServiceMock.findOne).toBeCalledWith({
        email: userData.email,
      })
    })

    it('should throw an error if user does not exist', async () => {
      usersServiceMock.findOne.mockResolvedValue(null)

      await expect(
        service.signin({
          email: userData.email,
          password: userData.password,
        }),
      ).rejects.toThrowError(new UnauthorizedException('Invalid credentials'))
    })

    it('should throw an error if password is incorrect', async () => {
      compareHash.mockResolvedValue(false)

      await expect(
        service.signin({
          email: userData.email,
          password: userData.password,
        }),
      ).rejects.toThrowError(new UnauthorizedException('Invalid credentials'))
      expect(compareHash).toBeCalledTimes(1)
    })
  })

  describe('signout', () => {
    it('should update the user refresh token to null', async () => {
      usersServiceMock.updateHashedRefreshToken.mockResolvedValue()
      await service.signout(userData.id)

      expect(usersServiceMock.updateHashedRefreshToken).toBeCalledTimes(1)
      expect(usersServiceMock.updateHashedRefreshToken).toBeCalledWith(
        userData.id,
        null,
      )
    })
  })

  describe('refresh', () => {
    let compareHash: jest.SpyInstance
    let updateRtAndGetNewTokens: jest.SpyInstance

    beforeEach(() => {
      compareHash = jest.spyOn(service, 'compareHash')
      updateRtAndGetNewTokens = jest.spyOn(service, 'updateRtAndGetNewTokens')
      usersServiceMock.findOne.mockResolvedValue(userData)
      compareHash.mockResolvedValue(true)
      updateRtAndGetNewTokens.mockResolvedValue(tokensData)
    })

    it('should refresh the user auth tokens', async () => {
      const response = await service.refresh(userData.id, 'old-refreshToken')

      expect(response).toMatchObject(tokensData)

      expect(usersServiceMock.findOne).toBeCalledWith({
        id: userData.id,
      })
      expect(compareHash).toBeCalledWith('old-refreshToken', userData.hashedRt)
      expect(updateRtAndGetNewTokens).toBeCalledWith(
        userData.id,
        userData.email,
      )
    })

    it('should throw an error if user does not exist', async () => {
      usersServiceMock.findOne.mockResolvedValue(null)

      await expect(
        service.refresh(userData.id, 'old-refreshToken'),
      ).rejects.toThrowError(new UnauthorizedException('Invalid credentials'))
    })

    it('should throw an error if hashedRt is null', async () => {
      usersServiceMock.findOne.mockResolvedValue({
        ...userData,
        hashedRt: null,
      })

      await expect(
        service.refresh(userData.id, 'old-refreshToken'),
      ).rejects.toThrowError(new UnauthorizedException('Invalid credentials'))
    })

    it('should throw an error if refresh token is invalid', async () => {
      compareHash.mockResolvedValue(false)

      await expect(
        service.refresh(userData.id, 'old-refreshToken'),
      ).rejects.toThrowError(new UnauthorizedException('Invalid credentials'))
    })
  })

  describe('updateRtAndGetNewTokens', () => {
    let signTokens: jest.SpyInstance
    let updateRefreshToken: jest.SpyInstance

    beforeEach(() => {
      signTokens = jest.spyOn(service, 'signTokens')
      updateRefreshToken = jest.spyOn(service, 'updateRefreshToken')
      signTokens.mockResolvedValue(tokensData)
      updateRefreshToken.mockResolvedValue(undefined)
    })

    it('should create new auth tokens and return them', async () => {
      const response = await service.updateRtAndGetNewTokens(
        userData.id,
        userData.email,
      )
      expect(response).toMatchObject(tokensData)

      expect(signTokens).toBeCalledWith(userData.id, userData.email)
    })

    it('should update the user refresh token', async () => {
      await service.updateRtAndGetNewTokens(userData.id, userData.email)

      expect(updateRefreshToken).toBeCalledWith(
        userData.id,
        tokensData.refreshToken,
      )
    })
  })

  describe('updateRefreshToken', () => {
    let hashData: jest.SpyInstance

    beforeEach(() => {
      hashData = jest.spyOn(service, 'hashData')
      hashData.mockResolvedValue('hashedRt')
      usersServiceMock.updateHashedRefreshToken.mockResolvedValue()
    })

    it('should hash the refresh token', async () => {
      await service.updateRefreshToken(userData.id, 'refreshToken')

      expect(hashData).toBeCalledWith('refreshToken')
    })

    it('should update the user with the hashed refresh token', async () => {
      await service.updateRefreshToken(userData.id, 'refreshToken')

      expect(usersServiceMock.updateHashedRefreshToken).toBeCalledWith(
        userData.id,
        'hashedRt',
      )
    })
  })

  describe('signTokens', () => {
    beforeEach(() => {
      jwtServiceMock.signAsync.mockResolvedValue(tokensData.accessToken)
    })

    it('should create new auth tokens', async () => {
      const tokens = await service.signTokens(userData.id, userData.email)
      expect(jwtServiceMock.signAsync).toBeCalledTimes(2)
      expect(tokens).toMatchObject({
        accessToken: tokensData.accessToken,
        refreshToken: tokensData.accessToken,
      })
    })

    it('should create new auth tokens with user id and email in payload', async () => {
      await service.signTokens(userData.id, userData.email)

      expect(jwtServiceMock.signAsync).toBeCalledWith(
        { userId: userData.id, email: userData.email },
        expect.any(Object),
      )
    })
  })

  describe('setAuthCookies', () => {
    it('should set the auth cookies', () => {
      const response = {
        cookie: jest.fn(),
      } as any

      service.setAuthCookies(response, tokensData)

      expect(response.cookie).toBeCalledTimes(2)
      expect(response.cookie).toHaveBeenNthCalledWith(
        1,
        config.get('JWT_AT_COOKIE_NAME'),
        tokensData.accessToken,
        {
          httpOnly: true,
          maxAge: parseInt(config.get('JWT_AT_EXPIRATION')) * 1000,
          path: '/',
        },
      )
      expect(response.cookie).toHaveBeenNthCalledWith(
        2,
        config.get('JWT_RT_COOKIE_NAME'),
        tokensData.refreshToken,
        {
          httpOnly: true,
          maxAge: parseInt(config.get('JWT_RT_EXPIRATION')) * 1000,
          path: '/',
        },
      )
    })
  })

  describe('clearAuthCookies', () => {
    it('should clear the auth cookies', async () => {
      const res = {
        clearCookie: jest.fn(),
      } as any

      service.clearAuthCookies(res)

      expect(res.clearCookie).toHaveBeenNthCalledWith(
        1,
        service.COOKIES_NAMES.accessToken,
      )
      expect(res.clearCookie).toHaveBeenNthCalledWith(
        2,
        service.COOKIES_NAMES.refreshToken,
      )
    })
  })

  describe('hashData', () => {
    it('should hash the data', async () => {
      argon2Mock.hash.mockResolvedValue('hashedData')

      const response = await service.hashData('data')
      expect(response).toBe('hashedData')
      expect(argon2Mock.hash).toBeCalledWith('data')
    })
  })

  describe('compareHash', () => {
    it.each([false, true])(
      'should compare the data with the hash and return %p',
      async (expectedResult) => {
        argon2Mock.verify.mockResolvedValue(expectedResult)

        const response = await service.compareHash('data', 'hashedData')
        expect(response).toBe(expectedResult)
        expect(argon2Mock.verify).toBeCalledWith('hashedData', 'data')
      },
    )
  })
})
