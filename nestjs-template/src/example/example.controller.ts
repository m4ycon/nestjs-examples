import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'

import { CreateExampleDto } from './dto/create-example.dto'
import { ExampleService } from './example.service'

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExampleDto: CreateExampleDto) {
    return this.exampleService.create(createExampleDto)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.exampleService.findOne(+id)
  }
}
