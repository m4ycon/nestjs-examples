import { CanActivate, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') implements CanActivate {}
