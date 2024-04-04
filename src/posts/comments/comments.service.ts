import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { Repository } from 'typeorm';
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

  async createComment(dto: CreateCommentDto, postId: number, userId: number) {
    return await this.commentsRepository.save({
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
    const preloadComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    const newComment = await this.commentsRepository.save(preloadComment);

    return newComment;
  }

  // async deleteComment(postId: number, commentId: number) {
  //   return await this.commentsRepository.delete({
  //     id: commentId,
  //   });
  // }
}
