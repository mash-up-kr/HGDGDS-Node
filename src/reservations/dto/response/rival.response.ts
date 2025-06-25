import { ApiProperty } from '@nestjs/swagger';

export class RivalResponse {
  @ApiProperty()
  rivalCount: number;
}
