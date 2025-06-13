import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';


export const ApiSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: ApiResponseOptions & { headers?: Record<string, any> }
) => {
  return applyDecorators(
    ApiResponse({
      ...options,
      type: model,
      headers: options?.headers,
    })
  );
};