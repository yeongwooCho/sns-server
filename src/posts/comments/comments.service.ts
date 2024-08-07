import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { CommonService } from '../../common/common.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

  async paginateComments(dto: PaginateCommentsDto, postId: number) {
    return await this.commonService.paginate<CommentsModel>(
      dto,
      this.commentsRepository,
      {
        ...DEFAULT_COMMENT_FIND_OPTIONS,
        where: {
          // postId 로 필터링 된 comments 만 가져온다.
          post: {
            id: postId,
          },
        },
      },
      `posts/${postId}/comments`, // nextUrl
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException(`id: ${id} Comment는 존재하지 않습니다.`);
    }

    return comment;
  }

  async createComment(
    dto: CreateCommentDto,
    postId: number,
    userId: number,
    qr?: QueryRunner,
  ) {
    const commentsRepository = this.getRepository(qr);

    return await commentsRepository.save({
      ...dto,
      post: {
        id: postId,
      },
      author: {
        id: userId,
      },
    });
  }

  async updateComment(
    userId: number,
    commentId: number,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        `id: ${commentId} Comment는 존재하지 않습니다.`,
      );
    }

    const preloadComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    const newComment = await this.commentsRepository.save(preloadComment);

    return newComment;
  }

  async deleteComment(userId: number, commentId: number, qr?: QueryRunner) {
    const commentsRepository = this.getRepository(qr);

    const comment = await commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        `id: ${commentId} Comment는 존재하지 않습니다.`,
      );
    }

    await commentsRepository.delete({
      id: commentId,
    });

    return commentId;
  }

  async isCommentMine(userId: number, commentId: number) {
    return await this.commentsRepository.exists({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
