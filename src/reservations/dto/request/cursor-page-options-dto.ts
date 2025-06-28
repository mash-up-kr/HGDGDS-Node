import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsNumber, Min, IsInt } from 'class-validator';
import { OrderCondition } from '@/common';

export class CursorPageOptionsDto {
  @ApiProperty({
    description:
      '이전/이후 데이터를 가져오기 위한 커서 값 (예: 마지막 데이터의 ID)',
    required: false,
    example: 100,
    type: 'number',
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly cursor?: number;

  @ApiProperty({
    description: '가져올 항목의 최대 개수',
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly limit: number = 10;

  @ApiProperty({
    description: '정렬 순서 (ASC: 오름차순, DESC: 내림차순)',
    default: OrderCondition.DESC,
    required: false,
  })
  @IsEnum(OrderCondition)
  @IsOptional()
  readonly order: OrderCondition = OrderCondition.DESC;

  @ApiProperty({
    description: '예약 상태 필터 (before: 지난 예약, after: 예정된 예약)',
    enum: ['before', 'after'],
    required: false,
    example: 'after',
  })
  @IsOptional()
  @IsEnum({ each: true })
  readonly status?: 'before' | 'after';
}
