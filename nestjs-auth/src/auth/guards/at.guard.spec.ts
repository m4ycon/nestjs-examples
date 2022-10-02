import { Reflector } from '@nestjs/core'

import { AtGuard } from './at.guard'

describe('AtGuard', () => {
  it('should be defined', () => {
    expect(new AtGuard(new Reflector())).toBeDefined()
  })
})
