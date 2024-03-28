import { join } from 'path';

// 서버 프로젝트의 루트 경로
export const PROJECT_ROOT_PATH = process.cwd();

// 외부에서 접근 가능한 파일들을 모아논 폴더 이름
export const PUBLIC_FOLDER_NAME = 'public';

// public 폴더 안에서 모듈마다 정리가 되어 있으면 한다.
// 그 중 posts 모듈의 이미지가 저장되는 폴더 이름
export const POSTS_FOLDER_NAME = 'posts';

// 임시 폴더 이름
export const TEMP_FOLDER_NAME = 'temp';

// 실제 공개 폴더의 절대 경로
// {프로젝트 위치}/public
// export const PUBLIC_FOLDER_PATH = `${PROJECT_ROOT_PATH}/${PUBLIC_FOLDER_NAME}`;
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

// posts 모듈의 이미지가 저장되는 폴더의 절대 경로
// {프로젝트 위치}/public/posts
export const POSTS_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME);

// 절대경로가 아닌 path 만 전달
// /public/posts/1.jpg
export const POSTS_FOLDER_PATH_WITHOUT_ROOT = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
);

// 임시 파일들을 저장할 폴더의 절대 경로
// {프로젝트 위치}/public/temp
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, TEMP_FOLDER_NAME);
