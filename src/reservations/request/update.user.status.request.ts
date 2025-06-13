import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusRequest {
  @ApiProperty({
    description: '예약 준비완료 여부',
    enum: ['READY', 'CANCEL'],
    example: 'READY or CANCLE',
    required: true,
    type: String,
  })
  status: 'READY' | 'CANCEL'; // TODO: enum으로 변경
}
