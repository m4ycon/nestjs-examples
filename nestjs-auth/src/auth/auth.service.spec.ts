import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import * as argon2 from 'argon2'
import { mock, mockReset } from 'jest-mock-extended'

import { TestUtils } from '../common'
import { UsersServiceInterface } from '../users/interfaces'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'

type UserProps = Pick<User, 'displayName' | 'email' | 'password'>

describe('AuthService', () => {
  let service: AuthService
  let userData: UserProps
  let userDataFull: User

  const usersServiceMock = mock<UsersServiceInterface>()
  const jwtServiceMock = mock<JwtService>()

  beforeEach(() => {
    mockReset(usersServiceMock)
    mockReset(jwtServiceMock)
    userData = TestUtils.genUser()
    userDataFull = {
      ...userData,
      id: Math.round(Math.random() * 100),
      hashedRt: '654564564',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({}), ConfigModule],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signup', () => {
    it('should return an object with tokens', async () => {
      usersServiceMock.create.mockResolvedValueOnce({ ...userData, id: 1 })
      jwtServiceMock.signAsync.mockResolvedValue('hashed-token')

      const response = await service.signup({
        ...userData,
        passwordConfirmation: userData.password,
      })

      expect(response).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    })
  })

  describe('signin', () => {
    it('should return an object with tokens', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true)
      jwtServiceMock.signAsync.mockResolvedValue('hashed-token')

      usersServiceMock.getUserInfo.mockResolvedValueOnce({
        ...userData,
        id: 1,
        hashedRt: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const response = await service.signin({
        email: userData.email,
        password: userData.password,
      })

      expect(response).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    })

    it('should throw unauthorized if user not found', async () => {
      usersServiceMock.getUserInfo.mockResolvedValueOnce(null)

      await expect(
        service.signin({
          email: userData.email,
          password: userData.password,
        }),
      ).rejects.toBeInstanceOf(
        new UnauthorizedException('Invalid credentials').constructor,
      )
    })

    it('should throw unauthorized if passwords do not match', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false)

      usersServiceMock.getUserInfo.mockResolvedValueOnce(userDataFull)

      await expect(
        service.signin({
          email: userData.email,
          password: userData.password,
        }),
      ).rejects.toBeInstanceOf(
        new UnauthorizedException('Invalid credentials').constructor,
      )
    })
  })

  describe('signout', () => {
    it('should return a message', async () => {
      const response = await service.signout(userDataFull.id)

      expect(usersServiceMock.updateHashedRefreshToken).toHaveBeenCalledTimes(1)
      expect(
        usersServiceMock.updateHashedRefreshToken,
      ).toHaveBeenLastCalledWith(userDataFull.id, null)

      expect(response).toMatchObject({
        message: 'Successfully logged out',
      })
    })
  })

  describe('refresh', () => {
    it('should return tokens', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true)
      jwtServiceMock.signAsync.mockResolvedValue('hashed-token')
      usersServiceMock.getUserInfo.mockResolvedValueOnce(userDataFull)

      const response = await service.refresh(userDataFull.id, 'refresh-token')

      expect(response).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
      expect(usersServiceMock.getUserInfo).toHaveBeenCalledTimes(1)
      expect(usersServiceMock.getUserInfo).toHaveBeenLastCalledWith({
        id: userDataFull.id,
      })
    })

    it('should return unauthorized if user not found', async () => {
      usersServiceMock.getUserInfo.mockResolvedValueOnce(null)

      await expect(
        service.refresh(userDataFull.id, 'refresh-token'),
      ).rejects.toBeInstanceOf(
        new UnauthorizedException('Invalid credentials').constructor,
      )

      expect(usersServiceMock.getUserInfo).toHaveBeenCalledTimes(1)
      expect(usersServiceMock.getUserInfo).toHaveBeenLastCalledWith({
        id: userDataFull.id,
      })
    })

    it('should return unauthorized if user hashedRt is null', async () => {
      usersServiceMock.getUserInfo.mockResolvedValueOnce({
        ...userDataFull,
        hashedRt: null,
      })

      await expect(
        service.refresh(userDataFull.id, 'refresh-token'),
      ).rejects.toBeInstanceOf(
        new UnauthorizedException('Invalid credentials').constructor,
      )

      expect(usersServiceMock.getUserInfo).toHaveBeenCalledTimes(1)
      expect(usersServiceMock.getUserInfo).toHaveBeenLastCalledWith({
        id: userDataFull.id,
      })
    })

    it('should return unauthorized if user hashedRt is different', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false)
      usersServiceMock.getUserInfo.mockResolvedValueOnce(userDataFull)

      await expect(
        service.refresh(userDataFull.id, 'refresh-token'),
      ).rejects.toBeInstanceOf(
        new UnauthorizedException('Invalid credentials').constructor,
      )
      expect(usersServiceMock.getUserInfo).toHaveBeenCalledTimes(1)
      expect(usersServiceMock.getUserInfo).toHaveBeenLastCalledWith({
        id: userDataFull.id,
      })
    })
  })

  describe('signTokensAndUpdateRefreshToken', () => {
    it('should return tokens', async () => {
      jwtServiceMock.signAsync.mockResolvedValue('hashed-token')
      usersServiceMock.updateHashedRefreshToken.mockResolvedValueOnce()
      jest.spyOn(argon2, 'hash').mockResolvedValueOnce('hashed-token')

      const response = await service.signTokensAndUpdateRefreshToken(
        userDataFull.id,
        userDataFull.email,
      )

      expect(response).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
      expect(usersServiceMock.updateHashedRefreshToken).toHaveBeenCalledTimes(1)
      expect(
        usersServiceMock.updateHashedRefreshToken,
      ).toHaveBeenLastCalledWith(userDataFull.id, 'hashed-token')
    })
  })

  describe('signTokens', () => {
    it('should return tokens', async () => {
      jwtServiceMock.signAsync.mockResolvedValue('hashed-token')
      const response = await service.signTokens(
        userDataFull.id,
        userDataFull.email,
      )

      expect(response).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2)
    })
  })

  describe('hashData', () => {
    it('should return a hashed string', async () => {
      jest.spyOn(argon2, 'hash').mockResolvedValueOnce('hashed-data')
      const hashed = await service.hashData('test')

      expect(hashed).toBe('hashed-data')
    })
  })

  describe('compareHashes', () => {
    it('should return true if hashes match', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true)
      const response = await service.compareHashes('hash', 'hash')

      expect(response).toBe(true)
    })

    it('should return false if hashes do not match', async () => {
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false)
      const response = await service.compareHashes('hash', 'hash')

      expect(response).toBe(false)
    })
  })

  describe('setAuthCookies', () => {
    it('should set auth cookies', () => {
      const response = {
        cookie: jest.fn(),
      }

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }

      service.setAuthCookies(response as any, tokens)

      expect(response.cookie).toHaveBeenCalledTimes(2)
      expect(response.cookie).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        tokens.accessToken,
        {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        },
      )
      expect(response.cookie).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        tokens.refreshToken,
        {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        },
      )
    })
  })

  describe('clearAuthCookies', () => {
    it('should clear auth cookies', () => {
      const res = {
        cookie: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
        clearCookie: jest.fn(),
      }
      service.clearAuthCookies(res as any)

      expect(res.clearCookie).toHaveBeenCalledTimes(2)
      expect(res.clearCookie).toHaveBeenNthCalledWith(1, 'accessToken')
      expect(res.clearCookie).toHaveBeenNthCalledWith(2, 'refreshToken')
    })
  })
})
