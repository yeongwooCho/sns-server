import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from '../../my_settings';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UsersModule } from '../users/users.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 우리가 만드려는 기능
   *
   * 1) registerWithEmail
   * - email, nickname, password를 입력받고 사용자를 생성한다.
   * - 생성이 완료되면 accessToken과 refreshToken을 반환한다.
   * - 회원가입 후 다시 로그인은 쓸데없는 과정이다.
   * - loginUser() 를 통해 토큰을 발급받는다.
   *
   * 2) loginWithEmail
   * - email, password를 입력하면 사용자 검증을 진행한다.
   * - 검증이 완료되면 accessToken과 refreshToken을 반환한다.
   * - loginUser() 를 통해 토큰을 발급받는다.
   *
   * 3) loginUser
   * - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환하는 로직
   * - 여기서 signToken() 을 두번 실행해서 access, refreshToken을 만든다.
   *
   * 4) signToken
   * - (3)에서 필요한 accessToken과 refreshToken을 sign하는 로직
   * - 토큰을 생성하는 로직이다.
   *
   * 5) authenticateWithEmailAndPassword
   * - loginWithEmail 에 담을 수 있지만 다른 곳에서 사용할 수 있으니 따로 빼둠
   * - (2) 에서 로그인을 진행할때 필요한 기본적인 검증 진행, 어떤 검증?
   *    1. 사용자가 존재하는지 확인(email)
   *    2. 비밀번호가 맞는지 확인
   *    3. 모두 통과되면 찾은 사용자 정보 반환
   * 이렇게 사용자 정보를 반환하면 2) loginWithEmail 에서
   * 반환된 사용자 데이터를 기반으로 토큰 생성
   */

  /**
   * JWT에는 사용자 정보가 들어가고 이는 payload에 삽입된다.
   * payload에 들어갈 정보
   * 1) email
   * 2) sub(Subject: 토큰의 제목) -> user.id
   * -> 토큰이 정상이면 이 값을 갖고 사용자 정보를 DB에서 가져온다.
   * 3) type: 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // seconds (60분, 5분)
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    // 1. 사용자가 존재하는지 확인(email)
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자 압니다.');
    }

    // 2. 비밀번호가 맞는지 확인
    // bcrypt.compare(a, b): a를 해쉬로 바꿔서 b와 비교한다.
    //  a - 입력된 비밀번호(암호화X)
    //  b - 기존 비밀번호(암호화 된 해쉬 값)
    const passOk = bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 3. 모두 통과되면 찾은 사용자 정보 반환
    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    // 에러가 발생하지 않고 여기까지 도착하면 인증이 완료된 것이다.
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
