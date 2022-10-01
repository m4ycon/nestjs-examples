import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as session from 'express-session'
import * as passport from 'passport'

import { AtGuard } from './auth/guards'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  /** Global configs */
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalGuards(new AtGuard()) // All routes are protected by default

  /** Passport session config */
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        // secure: true, // only with https
        maxAge: 60 * 60 * 1000, // 1h
        httpOnly: true, // will not allow client-side JavaScript to see the cookie
      },
    }),
  )
  app.use(passport.initialize())
  app.use(passport.session())

  await app.listen(process.env.PORT || 3333)
}
bootstrap()
