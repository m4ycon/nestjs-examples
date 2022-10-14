import { Module } from '@nestjs/common'

import { ExampleModule } from './example/example.module'
import { PrismaModule } from './prisma/prisma.module'
import { AppController } from './app.controller'

@Module({
  imports: [PrismaModule, ExampleModule],
  controllers: [AppController],
})
export class AppModule {}
