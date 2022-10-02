import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
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

  beforeEach(() => {
    mockReset(usersServiceMock)
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

  // TODO
  describe.skip('signTokensAndUpdateRefreshToken', () => undefined)
  describe.skip('signTokens', () => undefined)
  describe.skip('hashData', () => undefined)
  describe.skip('compareHashes', () => undefined)
})
