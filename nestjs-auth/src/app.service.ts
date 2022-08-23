import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  isUp() {
    return { ok: 'Up and running!' }
  }
}
