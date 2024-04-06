import {
  ClassSerializerInterceptor,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entity/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entity/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { ImageModel } from './common/entity/image.entity';
import { LogMiddle } from './common/middle/log.middle';
import { ChatsModule } from './chats/chats.module';
import { ChatsModel } from './chats/entity/chats.entity';
import { MessagesModel } from './chats/messages/entity/messages.entity';
import { CommentsModule } from './posts/comments/comments.module';
import { CommentsModel } from './posts/comments/entity/comments.entity';
import { RolesGuard } from './users/guard/roles.guard';
import { AccessTokenGuard } from "./auth/guard/bearer-token.guard";
import { UserFollowersModel } from "./users/entity/user-followers.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'env/development.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      // 데이터 베이스 타입
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      // 데이터 베이스와 연동될 모델이 추가된다.
      entities: [
        PostsModel,
        UsersModel,
        ImageModel,
        ChatsModel,
        MessagesModel,
        CommentsModel,
        UserFollowersModel,
      ],
      // NestJS 에서 작성하는 typeorm 코드와
      // database sync 를 자동으로 맞출 것인가?
      // 데이터의 구조가 갑자기 바뀔 수 있기에
      // development: true, production: false
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    CommonModule,
    ChatsModule,
    CommentsModule,
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
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer.apply(LogMiddle).forRoutes({
      path: '*',
      method: RequestMethod.GET,
    });
  }
}
