import { BaseModel } from './base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { join } from 'path';
import {
  POSTS_FOLDER_PATH,
  POSTS_FOLDER_PATH_WITHOUT_ROOT,
} from '../const/path.const';
import { PostsModel } from '../../posts/entities/posts.entity';

export enum ImageModelType {
  POST_IMAGE = 'POST_IMAGE',
}

@Entity()
export class ImageModel extends BaseModel {
  @Column({
    // order 값이 없으면 0으로 초기화
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number; // 여러 이미지의 순서

  // UserModel -> 사용자 프로필 이미지
  // PostsModel -> 게시글 이미지
  @Column({
    type: 'enum', // db column type is enum
    enum: ImageModelType,
    default: ImageModelType.POST_IMAGE,
  })
  @IsEnum(ImageModelType) // class-validator 에서 enum 으로 검증
  @IsString() // 값이 string 인지 검증
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return join('/', POSTS_FOLDER_PATH_WITHOUT_ROOT, value);
    } else {
      return value;
    }
  })
  path: string; // 이미지 경로

  @ManyToOne(() => PostsModel, (post) => post.images)
  post?: PostsModel;
}
