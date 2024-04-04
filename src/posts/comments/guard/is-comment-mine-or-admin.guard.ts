import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { RolesEnum, UsersModel } from '../../../users/entity/users.entity';
import { Request } from 'express';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('토큰을 제공해 주세요.');
    }

    /**
     * Admin은 모든 Comment에 대한 권한을 가지고 있다.
     */
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = request.params.commentId;

    if (!commentId) {
      throw new BadRequestException('commentId를 제공해 주세요.');
    }

    const isOk = await this.commentsService.isCommentMine(
      user.id,
      parseInt(commentId),
    );

    if (!isOk) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
