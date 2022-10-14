import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mock, mockReset } from 'jest-mock-extended'
import * as request from 'supertest'

import { TestUtils } from '../common/utils'
import { UserEntity } from '../entities'
import { ExampleController } from './example.controller'
import { ExampleService } from './example.service'

describe('ExampleController', () => {
  let app: INestApplication
  let userData: UserEntity

  const exampleServiceMock = mock<ExampleService>()

  beforeEach(async () => {
    mockReset(exampleServiceMock)
    jest.restoreAllMocks()

    userData = TestUtils.genUser()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [{ provide: ExampleService, useValue: exampleServiceMock }],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    await app.init()
  })

  it('should be defined', () => {
    expect(app).toBeDefined()
  })

  describe('create', () => {
    beforeEach(() => {
      exampleServiceMock.create.mockResolvedValue(userData)
    })

    it('should return the user created', async () => {
      const response = await request(app.getHttpServer())
        .post('/example')
        .send(userData)
        .expect(201)
        .then(res => res.body)

      expect(response).toEqual(userData)
      expect(exampleServiceMock.create).toHaveBeenCalledWith(userData)
    })
  })

  describe('findOne', () => {
    beforeEach(() => {
      exampleServiceMock.findOne.mockResolvedValue(userData)
    })

    it('should return the user found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/example/${userData.id}`)
        .expect(200)
        .then(res => res.body)

      expect(response).toEqual(userData)
      expect(exampleServiceMock.findOne).toHaveBeenCalledWith(userData.id)
    })
  })
})
