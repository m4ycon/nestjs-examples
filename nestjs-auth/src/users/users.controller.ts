import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'

import { AuthenticatedGuard, GetUser } from '../common'
import { UpdateUserDto } from './dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@GetUser() user: any) {
    return user
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto)
  }
}
