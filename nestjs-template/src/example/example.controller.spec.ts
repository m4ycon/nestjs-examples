import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'

import { ExampleController } from './example.controller'
import { ExampleService } from './example.service'

describe('ExampleController', () => {
  let controller: ExampleController

  const exampleServiceMock = mock<ExampleService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [{ provide: ExampleService, useValue: exampleServiceMock }],
    }).compile()

    controller = module.get<ExampleController>(ExampleController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
