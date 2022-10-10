import { randomInt, randomUUID } from 'crypto'

import { CookieUtils } from './CookieUtils'

describe('CookieUtils', () => {
  const res = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any
  const req = {
    cookies: jest.fn(),
  } as any

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('setHeaderWithCookie', () => {
    it('should set cookie in response header', () => {
      const payload = {
        userId: randomUUID(),
        email: randomUUID(),
      }
      const maxAge = randomInt(1000)

      CookieUtils.setHeaderWithCookie(res, payload, maxAge)
      expect(res.cookie).toHaveBeenNthCalledWith(1, 'userId', payload.userId, {
        httpOnly: true,
        maxAge: maxAge * 1000,
        path: '/',
      })
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'email', payload.email, {
        httpOnly: true,
        maxAge: maxAge * 1000,
        path: '/',
      })
    })
  })

  describe('getCookieValue', () => {
    it('should get cookie in request header', () => {
      const key = randomUUID()
      req.cookies.mockReturnValue({
        [key]: Math.round(Math.random() * 1000).toString(),
      })
      const value = CookieUtils.getCookieValue(req, key)
      expect(value).toEqual(req.cookies[key])
    })
  })

  describe('clearCookie', () => {
    it('should clear cookie in response header', () => {
      const key = randomUUID()
      CookieUtils.clearCookie(res, key)
      expect(res.clearCookie).toHaveBeenCalledWith(key)
    })
  })
})
