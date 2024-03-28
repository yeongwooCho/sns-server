import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POSTS_FOLDER_PATH } from '../common/const/path.const';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UsersModule,
    CommonModule,
    MulterModule.register({
      limits: {
        // 바이트 단위로 파일 사이즈를 제한한다.
        // 사이즈를 넘으면 에러를 발생시킨다.
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter(req, file, callback) {
        /**
         * req: Request
         * file: received file
         * callback(error: Error, acceptFile: boolean)
         * 첫번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다.
         * 두번째 파라미터에는 파일을 다운 받을지 말지에 대한 boolean 값을 넣어준다.
         *
         * path.extname(): 파일의 확장자를 가져온다.
         * import { extname } from 'path';
         */
        const ext = extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
          return callback(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, file, callback) => {
          callback(null, POSTS_FOLDER_PATH);
        },
        filename: (req, file, callback) => {
          // 파일이름을 uuid 로 생성한다.
          const filename = `${uuid()}-${extname(file.originalname)}`;

          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
