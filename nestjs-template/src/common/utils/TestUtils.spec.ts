import { TestUtils } from './TestUtils'

describe('TestUtils', () => {
  describe('genUser', () => {
    it('should generate a user ', () => {
      const user = TestUtils.genUser()

      expect(user).toHaveProperty('id')
      expect(typeof user.id).toBe('number')
    })
  })
})
