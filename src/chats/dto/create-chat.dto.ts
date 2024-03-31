import { IsNumber } from 'class-validator';

export class CreateChatDto {
  @IsNumber(
    {},
    {
      // list 일때 각각의 요소에 대한 유효성 검사를 수행한다.
      each: true,
    },
  )
  userIds: number[];
}
