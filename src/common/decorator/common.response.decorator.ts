import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CommonResponse } from '../response/common.response';

export const CommonResponseDecorator = <TModel extends Type<any>>(
  model?: TModel | TModel[],
) => {
  if (!model) {
    return applyDecorators(
      ApiOkResponse({
        schema: {
          properties: {
            code: { type: 'number', example: 200 },
            message: { type: 'string', example: 'OK' },
          },
        },
      }),
    );
  }
  const isArray = Array.isArray(model);
  const modelType = isArray ? model[0] : model;

  return applyDecorators(
    ApiExtraModels(CommonResponse, modelType),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(CommonResponse) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(modelType) },
                  }
                : { $ref: getSchemaPath(modelType) },
            },
          },
        ],
      },
    }),
  );
};
