import { Body, Controller, Get, Param, Post } from '@nestjs/common'

import { CreateExampleDto } from './dto/create-example.dto'
import { ExampleService } from './example.service'

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  create(@Body() createExampleDto: CreateExampleDto) {
    return this.exampleService.create(createExampleDto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exampleService.findOne(+id)
  }
}
