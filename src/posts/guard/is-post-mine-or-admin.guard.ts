import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';
import { RolesEnum, UsersModel } from '../../users/entity/users.entity';
import { Request } from 'express';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('토큰을 제공해 주세요.');
    }

    /**
     * Admin은 모든 Post에 대한 권한을 가지고 있다.
     */
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = request.params.postId;

    if (!postId) {
      throw new BadRequestException('postId를 제공해 주세요.');
    }

    const isOk = await this.postsService.isPostMine(user.id, parseInt(postId));

    if (!isOk) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
