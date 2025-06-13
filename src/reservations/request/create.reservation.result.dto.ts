import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreateReservationResultDto {
  @ApiProperty()
  isSuccess: boolean;

  @ApiProperty({
    required: false,
    type: [String],
    isArray: true,
    example: ['path/image1.jpg', 'path/image2.jpg'],
    description: '결과 이미지 URL 배열',
  })
  pictures: string[] | null;

  @ApiProperty({
    description: '예약 일시 (ISO8601 형식)',
    example: '2025-01-04T09:00:00+09:00',
  })
  @IsDateString()
  datetime: string;

  @ApiProperty()
  description: string;

  constructor(
    isSuccess: boolean,
    pictures: string[] | null,
    datetime: string,
    description: string,
  ) {
    this.isSuccess = isSuccess;
    this.pictures = pictures;
    this.datetime = datetime;
    this.description = description;
  }
}
