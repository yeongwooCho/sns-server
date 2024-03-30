import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const QueryRunner = createParamDecorator((context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  const queryRunner = req.queryRunner;

  if (!queryRunner) {
    throw new InternalServerErrorException(
      'QueryRunner decorator는 TransactionInterceptor와 함께 사용해야 합니다.',
    );
  }
  return queryRunner;
});
