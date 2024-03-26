import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmUserOption } from '../my_settings';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // 데이터 베이스 타입
      type: 'postgres',
      host: typeOrmUserOption.host,
      port: typeOrmUserOption.port,
      username: typeOrmUserOption.username,
      password: typeOrmUserOption.password,
      database: typeOrmUserOption.database,
      // 데이터 베이스와 연동될 모델이 추가된다.
      entities: [PostsModel, UsersModel],
      // NestJS 에서 작성하는 typeorm 코드와
      // database sync 를 자동으로 맞출 것인가?
      // 데이터의 구조가 갑자기 바뀔 수 있기에
      // development: true, production: false
      synchronize: true,
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // 모든 요청에 대해 class-transformer 를 적용한다.
      provide: APP_INTERCEPTOR,
      // class-transformer @Expose() 를 사용한 것에 대해 일괄 적용한다.
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
