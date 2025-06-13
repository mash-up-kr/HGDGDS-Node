import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export const ApiAuth = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiResponse({
      status: 401,
      description: '인증되지 않은 사용자',
      schema: {
        example: {
          code: 1003,
          message: '유효하지 않은 토큰입니다.',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '사용자를 찾을 수 없음',
      schema: {
        example: {
          code: 1000,
          message: '찾을 수 없는 유저입니다.',
        },
      },
    }),
  );
};
