import { Reflector } from '@nestjs/core'

import { AtGuard } from './at.guard'

describe('AtGuard', () => {
  let guard: AtGuard
  let reflector: Reflector

  beforeEach(() => {
    reflector = new Reflector()
    guard = new AtGuard(reflector)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })
})
