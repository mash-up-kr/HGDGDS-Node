import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserMessageRequest {
  @ApiProperty({
    description: '상태 메시지',
  })
  message: string;
}
