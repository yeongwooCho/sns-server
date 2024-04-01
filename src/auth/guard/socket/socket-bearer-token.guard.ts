import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { UsersService } from '../../../users/users.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();

    const headers = socket.handshake.headers;

    const rawToken = headers['authorization'];

    if (!rawToken) {
      throw new WsException('토큰이 없습니다.');
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      // payload 정보를 가져올 수 있다.
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      // REST API 였으면 request 에 넣어줬을 것이다.
      socket.user = user;
      socket.token = token;
      socket.tokenType = payload.type;

      return true;
    } catch (e) {
      throw new WsException('토큰이 유효하지 않습니다.');
    }
  }
}

@Injectable()
class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // payload 정보를 가져올 수 있다.
    const result = await this.authService.verifyToken(token);

    /**
     * request 에 넣을 정보 -> 또 검증을 받을 수 있으니깐.
     * 1) 사용자 정보 - user (받아와야 한다.)
     * 2) token - token (여기 있다.)
     * 3) tokenType - access | refresh (result 에 있다.)
     */
    req.user = await this.usersService.getUserByEmail(result.email);
    req.token = token;
    req.tokenType = result.type;

    return result;
  }
}
