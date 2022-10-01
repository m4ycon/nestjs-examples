import { JwtRefreshGuard } from './jwt-refresh.guard'

describe('JwtRefreshGuard', () => {
  it('should be defined', () => {
    expect(new JwtRefreshGuard()).toBeDefined()
  })
})
