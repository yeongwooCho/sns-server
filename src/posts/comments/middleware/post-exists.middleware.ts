import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PostsService } from '../../posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException('postId 파라미터는 필수입니다.');
    }

    const exists = await this.postsService.checkPostExistsById(
      parseInt(postId),
    );

    if (!exists) {
      throw new NotFoundException('Post가 존재하지 않습니다.');
    }

    // 다 통과하면 다음 로직으로 넘어간다.
    next();
  }
}
