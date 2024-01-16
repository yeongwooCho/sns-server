import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmUserOption } from '../my_settings';
import { PostsModel } from './posts/entities/posts.entity';

@Module({
  imports: [
    PostsModule,
    TypeOrmModule.forRoot({
      // 데이터 베이스 타입
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: typeOrmUserOption.username,
      password: typeOrmUserOption.password,
      database: 'postgres',
      // 데이터 베이스와 연동될 모델이 추가된다.
      entities: [PostsModel],
      // NestJS 에서 작성하는 typeorm 코드와
      // database sync 를 자동으로 맞출 것인가?
      // 데이터의 구조가 갑자기 바뀔 수 있기에
      // development: true, production: false
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
