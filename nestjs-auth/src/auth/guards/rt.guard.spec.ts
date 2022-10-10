import { RtGuard } from './rt.guard'

describe('RtGuard', () => {
  let guard: RtGuard

  beforeEach(() => {
    guard = new RtGuard()
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })
})
