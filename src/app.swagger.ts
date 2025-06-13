import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function swaggerConfig(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('허거덩거덩스 API 문서')
    .setDescription('허거덩거덩스 REST API 문서')
    .addBearerAuth()
    .build();

  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      operationsSorter: 'method',
    },
  });
}
