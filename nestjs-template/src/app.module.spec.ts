import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from './app.module'

/**
 * This ensures that all the imports and providers are valid
 * This helps to have a better test coverage of modules.
 */
describe('AppModule', () => {
  let appModule: AppModule

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    appModule = app.get<AppModule>(AppModule)
  })

  it('should be defined', () => {
    expect(appModule).toBeDefined()
  })
})
