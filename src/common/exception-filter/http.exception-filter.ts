import {
  HttpException,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // ArgumentsHost 는 host.switchToHttp() 를 통해 HttpArgumentsHost 로 변환할 수 있다.
    // HttpArgumentsHost 는 Request 와 Response 객체를 제공한다. context이다.
    const ctx = host.switchToHttp();

    // Response 객체를 가져온다.
    const response = ctx.getResponse();

    // Request 객체를 가져온다.
    const request = ctx.getRequest();

    // HttpException 을 통해 status 를 가져온다.
    const status = exception.getStatus();

    // 로그 파일을 생성하거나
    // 에러 모니터링 시스템에 API 콜하기

    // response 객체를 통해 status 를 반환한다.
    // 이때 status 는 변경 가능하다.
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toLocaleString('kr'),
      path: request.url,
    });
  }
}
