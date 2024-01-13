import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Put } from "@nestjs/common";
import { PostsService } from "./posts.service";

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: "newjeans",
    title: "뉴진스 민지",
    content: "수리하는 민지",
    likeCount: 12345,
    commentCount: 24139
  }, {
    id: 2,
    author: "newjeans_official",
    title: "뉴진스 혜린",
    content: "노래하는 민지",
    likeCount: 11111,
    commentCount: 44444
  },
  {
    id: 3,
    author: "newjeans_official",
    title: "블랙핑크 로제",
    content: "춤추는 로제",
    likeCount: 10000,
    commentCount: 20000
  }
];

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {
  }

  // 1) GET /posts
  @Get()
  getPosts() {
    return posts;
  }

  // 2) GET /posts/:id
  @Get(":id")
  getPost(@Param("id") id: string) {
    const post = posts.find((post) => post.id == +id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  // 3) Post /posts
  @Post()
  postPosts(
    @Body("author") author: string,
    @Body("title") title: string,
    @Body("content") content: string
  ) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0
    };

    posts = [
      ...posts,
      post
    ];

    return post;
  }

  // 4) PUT /posts/:id

  // 5) DELETE /posts/:id

}
