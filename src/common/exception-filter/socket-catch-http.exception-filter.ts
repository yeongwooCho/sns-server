import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const socket = host.switchToWs().getClient();

    socket.emit('exception', {
      data: exception.getResponse(),
    });
  }
}
