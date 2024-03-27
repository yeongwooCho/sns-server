import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, FindOptionsOrder, Repository } from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { HOST, PROTOCOL } from './const/env.const';

@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data: data,
      total: count,
    };
  }
  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions, // 함수 자체적으로 갖고 있는 옵션을 덮어씌운다.
    });

    /**
     * 해당되는 포스트가 0개 이상이면 마지막 포스트를 가져오고
     * 아니면 null 을 반환한다.
     */
    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/${path}`);

    if (nextUrl) {
      /**
       * dto 의 키값들을 루핑하면서 key 값에 해당되는 value 가 존재하면
       * param 에 그대로 붙여 넣는다.
       *
       * 단, where_id_more_than 값만 lastItem 의 마지막 값으로 넣어준다.
       */
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    /**
     * Response
     *
     * data: Date[],
     * cursor: {
     *   after: 마지막 Data 의 ID
     * },
     * count: 응답한 데이터의 갯수
     * next: 다음 요청을 할때 사용할 URL
     */

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * return
     * where, order, take, skip(page 기반일때만)
     *
     * DTO 의 현재 생긴 구조는 다음과 같다.
     * {
     *   where__id__more_than: 1,
     *   order__createdAt: 'ASC',
     * }
     * 현재는 where__id__more_than 을 사용한다.
     * 나중에는 where__likeCount__more_than 이나 where__title__ilike 등
     * 추가 필터 기능을 추가할때 모든 where 필터들을 자동으로 파싱하는 기능 필요.
     *
     * 1) where 로 시작하면 필터 로직을 적용
     * 2) 필터 로직을 적용하면 '__' 를 기준으로 split 했을때 3개 값으로 나뉘는지 두개 값으로 나뉘는지 확인한다.
     *     3-1) 3개 값으로 나뉘면 FILTER_MAPPER 에서 해당되는 operator 함수를 찾아서 적용
     *       ['where', 'id', 'more_than'] -> FILTER_MAPPER['more_than'](id, 1)
     *     3-2) 2개 값으로 나뉘면 정확한 값을 필터하는 것이기 떄문에 operator 없이 적용
     *       ['where', 'id'] -> { id: 1 }
     * 3) order 로 시작하면 정렬 로직을 적용. order 의 경우 3-2) 와 같이 적용한다.
     */
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // key: where__id__less_than, value: 1
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereOrOrderFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereOrOrderFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? (dto.page - 1) * dto.take : undefined,
    };
  }

  private parseWhereOrOrderFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> | FindOptionsOrder<T> = {};

    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `'__'를 기준으로 2개 또는 3개의 값이어야 합니다.\n 문제 되는 키값 : ${key}`,
      );
    }

    if (split.length === 2) {
      const [_, field] = split;

      options[field] = value;
    } else {
      const [_, field, operator] = split;

      // 여러 값이 필요한 경우 다음과 같이 구분함.
      // where__id__in=1,2,3,4
      // split은 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      const values = value.toString().split(',');

      // FILTER_MAPPER 에서 해당되는 operator 함수를 찾아서 적용
      // 함수 뒤에 ()를 붙이면 함수가 실행된다. 이때 파라미터를 전달한 것이다.
      if (values.length > 1) {
        options[field] = FILTER_MAPPER[operator](...values);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }

    return options;
  }
}
