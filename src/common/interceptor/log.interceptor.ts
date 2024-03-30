import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    /**
     * 요청이 들어올때 REQ 요청이 들어온 타임 스탬프를 찍는다.
     * [REQ] {request method} {request path} {timestamp}
     *
     * 요청이 끝날때 RES 요청이 끝난 타임 스탬프를 찍는다.
     * [RES] {request method} {request path} {timestamp}
     */
    const now = new Date();
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;

    // console.log(req.path); // /posts
    // console.log(path); // /posts?order__createdAt=DESC&limit=10&page=1

    // [REQ] {request method} {request path} {timestamp}
    // 한국 날짜 형태로 변환해서 출력
    console.log(`[REQ] ${req.method} ${path} (${now.toLocaleString('kr')})`);

    // next.handle() 은 Observable 을 반환한다.
    // return next.handle() 을 실행하는 순간 Route의 로직이 전부 실행되고 응답이 반환된다.
    // 이때 Observable 을 반환하므로 subscribe 를 통해 응답을 받을 수 있다.
    return next.handle().pipe(
      tap(() => {
        // [RES] {request method} {request path} {duration timestamp ms}
        const duration = new Date().getMilliseconds() - now.getMilliseconds();

        console.log(
          `[RES] ${req.method} ${path} (${now.toLocaleString('kr')} - ${duration}ms)`,
        );
      }),
    );
  }
}
