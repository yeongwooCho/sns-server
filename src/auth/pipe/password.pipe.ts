import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * 다음 Pipe 는 class-validator 를 사용해서 대체 됨.
 */
@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (value.toString().length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해 주세요.');
    }
    return value.toString();
  }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(
    private readonly length: number,
    private readonly subject: string,
  ) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    if (value.toString().length > this.length) {
      throw new BadRequestException(
        `${this.subject}의 최대 길이는 ${this.length}입니다.`,
      );
    }
    return value.toString();
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(private readonly length: number) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    if (value.toString().length < this.length) {
      throw new BadRequestException(`최소 길이는 ${this.length}입니다.`);
    }
    return value.toString();
  }
}
