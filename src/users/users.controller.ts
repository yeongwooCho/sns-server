import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  @Post()
  postUser(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.usersService.createUser(nickname, email, password);
  }

  @Patch(':id')
  patchUser(
    @Param('id') id: string,
    @Body('nickname') nickname?: string,
    @Body('email') email?: string,
    @Body('password') password?: string,
  ) {
    return this.usersService.updateUser(+id, nickname, email, password);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }
}
