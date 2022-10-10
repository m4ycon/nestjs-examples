import { Controller, Get } from '@nestjs/common'

import { Public } from './common'

@Controller()
export class AppController {
  @Get()
  @Public()
  up(): string {
    return 'Up and running!'
  }
}
