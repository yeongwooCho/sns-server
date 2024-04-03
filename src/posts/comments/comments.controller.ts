import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../../users/decorator/user.decorator';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @UseGuards(AccessTokenGuard)
  getComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  createComment(
    @User('id') userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.createComment(body, postId, userId);
  }

  // @Patch(':commentId')
  // @UseGuards(AccessTokenGuard)
  // updateComment(
  //   @User('id') userId: number,
  //   @Param('postId', ParseIntPipe) postId: number,
  //   @Param('commentId', ParseIntPipe) commentId: number,
  // ) {
  //   return this.commentsService.updateComment(postId, commentId);
  // }
  //
  // @Delete(':commentId')
  // @UseGuards(AccessTokenGuard)
  // deleteComment(
  //   @User('id') userId: number,
  //   @Param('postId', ParseIntPipe) postId: number,
  //   @Param('commentId', ParseIntPipe) commentId: number,
  // ) {
  //   return this.commentsService.deleteComment(postId, commentId);
  // }
}
