import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorator/roles.decorator';
import { RolesEnum } from './entity/users.entity';
import { User } from './decorator/user.decorator';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  // @UseInterceptors(ClassSerializerInterceptor)
  /**
   * serialization(직렬화)
   * -> 현재 시스템에서 사용되는 NestJS 데이터 구조를 다른 시스템에서도
   * 쉽게 사용할 수 있는 포맷으로 변환
   * -> class의 object에서 JSON 포맷으로 변환
   *
   * deserialization(역직렬화)
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  // @Post()
  // postUser(
  //   @Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   return this.usersService.createUser({
  //     nickname,
  //     email,
  //     password,
  //   });
  // }

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

  @Get('follow/me')
  getFollow(
    @User('id', ParseIntPipe) userId: number,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe)
    includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(userId, includeNotConfirmed);
  }

  @Post('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async postFollow(
    @QueryRunner() qr: QR,
    @User('id') userId: number,
    @Param('id', ParseIntPipe) targetId: number,
  ) {
    await this.usersService.followUser(userId, targetId, qr);

    return true;
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @QueryRunner() qr: QR,
    @User('id') userId: number,
    @Param('id', ParseIntPipe) followerId: number,
  ) {
    await this.usersService.confirmFollow(userId, followerId, qr);

    return true;
  }

  @Delete('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(
    @QueryRunner() qr: QR,
    @User('id') userId: number,
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.unfollowUser(userId, followeeId, qr);

    return true;
  }
}
