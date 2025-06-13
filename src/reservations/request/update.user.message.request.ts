import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserMessageRequest {
  @ApiProperty({
    description: '예약 메시지',
    example: '예약 메시지 내용',
    required: true,
    type: String,
  })
  message: string;
}
