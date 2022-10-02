import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { SessionSerializer } from './serializers'
import { AtStrategy, RtStrategy } from './strategies'

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer, AtStrategy, RtStrategy],
})
export class AuthModule {}
