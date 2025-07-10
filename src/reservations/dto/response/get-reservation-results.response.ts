import { ApiProperty } from '@nestjs/swagger';
import { CreateReservationResultDto } from './create-reservation-result.dto';

export class GetReservationResultsResponse {
  @ApiProperty({
    description:
      '호스트 정보. 호스트가 결과를 등록하지 않은 경우 null일 수 있습니다.',
    type: CreateReservationResultDto,
    nullable: true,
  })
  host: CreateReservationResultDto | null;

  @ApiProperty({
    description: '예약 결과 목록 (호스트 제외)',
    type: [CreateReservationResultDto],
  })
  results: CreateReservationResultDto[];

  constructor(
    host: CreateReservationResultDto | null,
    results: CreateReservationResultDto[],
  ) {
    this.host = host;
    this.results = results;
  }
}
