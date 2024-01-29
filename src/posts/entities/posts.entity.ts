import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    // userId 는 post에서 갖기 떄문에 option 은 여기서 작성한다.
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: 'title 은 string 타입을 입력 해줘야 합니다.',
  })
  title: string;

  @Column()
  @IsString({
    message: 'content 는 string 타입을 입력 해줘야 합니다.',
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
