import { catchError, Observable, tap } from 'rxjs';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    // transaction 과 관련된 모든 쿼리를 담당할 query runner 를 생성한다.
    const qr = this.dataSource.createQueryRunner();

    // query runner 에 연결한다. 그럼 transaction 을 시작할 수 있다.
    await qr.connect();

    // query runner 에서 transaction 을 시작한다.
    // 이 시점부터 같은 query runner 를 사용하면 transaction 안에서 DB action 을 실행할 수 있다.
    await qr.startTransaction();

    req.queryRunner = qr;

    return next.handle().pipe(
      catchError(async (error) => {
        // 에러가 발생하면 transaction 을 rollback 한다.
        await qr.rollbackTransaction();

        // query runner 를 release 한다.
        await qr.release();

        // 에러를 다시 던진다.
        throw error;
      }),
      tap(async () => {
        // transaction 을 commit 한다.
        await qr.commitTransaction();

        // query runner 를 release 한다.
        await qr.release();
      }),
    );
  }
}
