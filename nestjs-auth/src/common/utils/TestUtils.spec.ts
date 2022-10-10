import { TestUtils } from './TestUtils'

describe('TestUtils', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('genUser', () => {
    it('should generate a user ', () => {
      const user = TestUtils.genUser()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('displayName')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('password')
      expect(user).toHaveProperty('hashedRt')
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')

      expect(typeof user.id).toBe('number')
      expect(typeof user.displayName).toBe('string')
      expect(typeof user.email).toBe('string')
      expect(typeof user.password).toBe('string')
      expect(typeof user.hashedRt).toBe('string')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('genTokens', () => {
    it('should generate tokens ', () => {
      const tokens = TestUtils.genTokens()

      expect(tokens).toHaveProperty('accessToken')
      expect(tokens).toHaveProperty('refreshToken')

      expect(typeof tokens.accessToken).toBe('string')
      expect(typeof tokens.refreshToken).toBe('string')
    })
  })
})
