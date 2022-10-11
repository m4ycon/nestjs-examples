import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      /* validator will strip validated (returned) object of any 
      properties that do not use any validation decorators */
      whitelist: true,
      /* instead of stripping non-whitelisted properties 
      validator will throw an exception */
      forbidNonWhitelisted: true,
    }),
  )

  app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle('Nest Example API')
    // .setDescription('The cats API description')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3333)
}
bootstrap()
