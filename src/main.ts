import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // DTO 에서 class-validator 데코레이터를 사용하면 자동으로 유효성 검사를 수행한다.
      // 이때 transform 옵션을 true 로 설정하면 요청이 들어올 때 자동으로 타입 변환을 수행한다.
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
