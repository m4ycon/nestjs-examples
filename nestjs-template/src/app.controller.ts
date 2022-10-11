import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  isUp(): string {
    return 'Up and running!'
  }
}
