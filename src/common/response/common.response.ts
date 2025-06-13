import { ApiProperty } from '@nestjs/swagger';

export class CommonResponse<T> {
  @ApiProperty({ example: 200 })
  code: number;
  @ApiProperty({ example: 'OK' })
  message: string;
  @ApiProperty({ type: () => Object, required: false })
  data?: T;

  constructor(code: number, message: string, data?: T) {
    this.code = code;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }
}
