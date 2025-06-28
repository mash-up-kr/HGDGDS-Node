import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CursorPageMetaDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '전체 데이터 개수',
  })
  readonly total: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '이번 응답에서 가져온 데이터 개수',
  })
  readonly take: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: '다음 페이지 데이터 존재 여부',
  })
  readonly hasNextData: boolean;

  @Expose()
  @ApiProperty({
    type: Number,
    nullable: true,
    description: '다음 페이지로 이동하기 위한 커서 ID',
  })
  readonly cursor: number | null;

  constructor(
    total: number,
    take: number,
    hasNextData: boolean,
    cursor: number | null,
  ) {
    this.total = total;
    this.take = take;
    this.hasNextData = hasNextData;
    this.cursor = cursor;
  }
}
