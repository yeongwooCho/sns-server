import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { UsersModel } from '../users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post-dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from '../common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/Images.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  // 1) GET /posts
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  // 1) POST /posts/random
  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  // 2) GET /posts/:id
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) Post /posts
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPost(
    @User('id') userId: number,
    @Body() body: CreatePostDto, // DTO - Data Transfer Object
  ) {
    // transaction 과 관련된 모든 쿼리를 담당할 query runner 를 생성한다.
    const qr = this.dataSource.createQueryRunner();

    // query runner 에 연결한다. 그럼 transaction 을 시작할 수 있다.
    await qr.connect();

    // query runner 에서 transaction 을 시작한다.
    // 이 시점부터 같은 query runner 를 사용하면 transaction 안에서 DB action 을 실행할 수 있다.
    await qr.startTransaction();

    // 로직 실행
    try {
      const post = await this.postsService.createPost(userId, body, qr);

      // transaction test
      // throw new InternalServerErrorException('테스트');

      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }

      // transaction 을 commit 한다.
      await qr.commitTransaction();

      return this.postsService.getPostById(post.id);
    } catch (e) {
      // transaction 을 rollback 한다.
      await qr.rollbackTransaction();
      throw e;
    } finally {
      // query runner 를 release 한다.
      await qr.release();
    }
  }

  // 4) PATCH /posts/:id
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, body);
  }

  // 5) DELETE /posts/:id
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
