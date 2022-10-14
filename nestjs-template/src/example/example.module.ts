import { Module } from '@nestjs/common'

import { ExampleController } from './example.controller'
import { ExampleService } from './example.service'

@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class ExampleModule {}
