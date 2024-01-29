import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({
    message: 'title 은 string 타입을 입력 해줘야 합니다.',
  })
  title: string;

  @IsString({
    message: 'content 는 string 타입을 입력 해줘야 합니다.',
  })
  content: string;
}
