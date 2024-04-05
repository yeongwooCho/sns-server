import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { PostsModel } from '../../posts/entity/posts.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { Exclude, Expose } from 'class-transformer';
import { ChatsModel } from '../../chats/entity/chats.entity';
import { MessagesModel } from '../../chats/messages/entity/messages.entity';
import { CommentsModel } from '../../posts/comments/entity/comments.entity';

export enum RolesEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /**
   * Request
   * frontend -> backend
   * plain object (JSON) -> class instance(dto)
   *
   * Response
   * backend -> frontend
   * class instance(dto) -> plain object (JSON)
   *
   * toClassOnly -> class instance 로 변환될때만(요청)
   * toPlainOnly -> plain object 로 변환될때만(응답)
   * 옵션 입력 안하면 둘다 적용되는데 우리는 비밀번호를 받아야 한다.
   */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    // enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @ManyToOne(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;

  @OneToMany(() => CommentsModel, (comment) => comment.author)
  postComments: CommentsModel[];

  // 팔로우 하고 있는 유저
  @ManyToMany(() => UsersModel, (user) => user.followees)
  @JoinTable()
  followers: UsersModel[];

  // followers에 의해 follow를 받는 유저
  @ManyToMany(() => UsersModel, (user) => user.followers)
  followees: UsersModel[];
}
