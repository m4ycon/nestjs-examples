import { Body, Controller, Get, Param, Patch } from '@nestjs/common'

import { GetUser, Public } from '../common'
import { UpdateUserDto } from './dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get('me')
  me(@GetUser() user: any) {
    return user
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id)
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto)
  }
}
