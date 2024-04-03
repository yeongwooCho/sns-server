import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { Repository } from 'typeorm';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { CommonService } from '../../common/common.service';

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
  //
  // async getComment(commentId: number) {
  //   return await this.commentsRepository.findOne({
  //     where: {
  //       id: commentId,
  //     },
  //   });
  // }
  //
  // async createComment(dto: CreateCommentDto) {
  //   return await this.commentsRepository.save(dto);
  // }
  //
  // async updateComment(postId: number, commentId: number) {
  //   return await this.commentsRepository.save({
  //     id: commentId,
  //   });
  // }
  //
  // async deleteComment(postId: number, commentId: number) {
  //   return await this.commentsRepository.delete({
  //     id: commentId,
  //   });
  // }
}
