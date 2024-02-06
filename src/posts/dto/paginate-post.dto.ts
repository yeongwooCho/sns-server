import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatePostDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID 보다 높은 ID 부터 값을 가져오기
  // @Type(() => Number)
  @IsNumber()
  @IsOptional()
  // 없으면 0으로 처리
  where__id_more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id_less_than?: number;

  // 정렬
  // createAt -> 생성된 시간의 내림차/오름차 순으로 정렬;
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC'; // 일단 오름차순만 진행

  // 몇개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take: number = 20;
}
