import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  MaxLengthPipe,
  MinLengthPipe,
  PasswordPipe,
} from './pipe/password.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  createTokenAccess(@Headers('authorization') rawString: string) {
    const token = this.authService.extractTokenFromHeader(rawString, true);
    const newToken = this.authService.rotateToken(token, false);

    // { accessToken: {token} }
    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  createTokenRefresh(@Headers('authorization') rawString: string) {
    const token = this.authService.extractTokenFromHeader(rawString, true);
    const newToken = this.authService.rotateToken(token, true);

    // { refreshToken: {token} }
    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  postLoginEmail(@Headers('authorization') rawToken: string) {
    // token은 현재 base64.encode(email:password) 상태이다.
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password', new MaxLengthPipe(8, '비밀번호'), new MinLengthPipe(3))
    password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
  }
}
