import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from '../entity/users.entity';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * Roles Annotation에 대한 metadata를 가져온다. 그래야 권한을 확인할 수 있다.
     *
     * 그래서 reflector 를 사용한다.
     * NestJS IoC Container에 의해 주입된다.
     * getAllAndOverride 메소드를 사용하여 metadata를 가져온다.
     * ROLES_KEY 에 해당되는 annotation 정보를 다 가져온다.
     * 그 중 가장 가까운 annotation 정보를 가져와서 override 해준다.
     */
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Roles Annotation 이 등록되어 있지 않음
    // 막고 싶은 의지가 없다. -> true로 RolesGuard를 통과시킨다.
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('토큰을 제공해 주세요.');
    }

    if (user.role !== requiredRoles) {
      throw new ForbiddenException(
        `접근 권한이 없습니다. ${requiredRoles}이 필요합니다.`,
      );
    }

    return true;
  }
}
