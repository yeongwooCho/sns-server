import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from '../../../users/entity/users.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { PostsModel } from '../../entity/posts.entity';
import { stringValidationMessage } from '../../../common/validation-message/string-validation.message';
import { IsNumber, IsString } from 'class-validator';

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (author) => author.postComments)
  author: UsersModel;

  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  comment: string;

  @Column({
    default: 0,
  })
  @IsNumber()
  likeCount: number;
}
