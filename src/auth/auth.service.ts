import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from '../../my_settings';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 토큰을 사용하게 되는 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 진행하면
   * accessToken 과 refreshToken 을 발급 받는다.
   *
   * 2) 로그인 할때는 Basic 토큰과 함께 요청을 보낸다.
   * Basic 토큰은 '이메일:비밀번호'를 base64로 인코딩한 형태이다.
   * 예) {authorization: 'Basic {token}'}
   *
   * 3) 아무나 접근할 수 없는 정보 (private route)를 접근 할때는
   * accessToken 을 Header 에 추가해서 요청과 함께 보낸다.
   * 예) {authorization: 'Bearer {token}'}
   *
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해
   * 현재 요청을 보낸 사용자가 누구인지 알 수 있다.
   * JWT 안에 id, email 이 있기에 사용자가 누군지 알 수 있다.
   * 예) 현재 로그인한 사용자가 작성한 포스트만 가져오려면
   * 토큰의 sub 값에 입력되어 있는 사용자의 포스트만 따로 필터링 할 수 있다.
   * 특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근 못한다.
   *
   * 5) 모든 토큰은 만료 기간이 있다. 만료기간이 지나면 새로 토큰을 발급 받아야 한다.
   * 그렇지 않으면 jwtService.verify() 에서 인증 통과가 안 된다.
   * 그러니 access 토큰을 새로 발급 받을 수 있는 /auth/token/access 와
   * refresh 토큰을 새로 발급 받을 수 있는 /auth/token/refresh 가 필요하다.
   * 기획에 따라 refresh 는 재발급 안 되야 하는 경우도 있지만 우리는 한다.
   *
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청을 해서
   * 새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route 에 접근한다.
   */

  /**
   * Header로 부터 토큰을 받을때
   * {authorization: 'Basic {token}'}
   * {authorization: 'Bearer {token}'}
   * header 에는 'Basic {token}' 아니면 'Bearer {token}'가 들어간다.
   * 사용자의 요청은 언제나 잘못될 수 있다. 항상 까다롭게 체크해야 한다.
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    return splitToken[1];
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  /**
   * 토큰 검증
   */
  verifyToken(token: string) {
    try {
      // payload 반환
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.verifyToken(token);

    /**
     * sub: id
     * email: email
     * type: 'access' | 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 Refresh 토큰으로만 가능합니다.',
      );
    }

    return this.signToken(
      { email: decoded.email, id: decoded.sub },
      isRefreshToken,
    );
  }

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
    const passOk = await bcrypt.compare(user.password, existingUser.password);

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

  async registerWithEmail(user: RegisterUserDto) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
