import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: true, // TODO: change to your domain, this is for development
    credentials: true, // enable CORS response for requests with credentials (cookies, http authentication)
  })

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

  const config = new DocumentBuilder()
    .setTitle('NestJS Template')
    .setDescription('The NestJS Template API description')
    .setVersion('1.0')
    .addTag('nestjs-template')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3333)
}
bootstrap()
