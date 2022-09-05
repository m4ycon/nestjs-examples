import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from './app.module'

// this test is mainly made for catching import errors
// module bad imports
describe('AppController', () => {
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
