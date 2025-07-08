import { ApiProperty } from '@nestjs/swagger';
import { CreateReservationResultDto } from './create-reservation-result.dto';

export class GetReservationResultsResponseDto {
  @ApiProperty({
    description: '호스트 정보',
    type: CreateReservationResultDto,
  })
  host: CreateReservationResultDto;

  @ApiProperty({
    description: '예약 결과 목록',
    type: [CreateReservationResultDto],
  })
  results: CreateReservationResultDto[];
}
