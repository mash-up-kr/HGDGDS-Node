import { ApiProperty } from '@nestjs/swagger';
import { CreateReservationResultDto } from './create-reservation-result.dto';

export class GetReservationResultsResponse {
  @ApiProperty({
    description: 'API를 요청한 현재 사용자의 예약 결과.',
    type: CreateReservationResultDto,
    nullable: true,
  })
  currentUser: CreateReservationResultDto | null;

  @ApiProperty({
    description: '예약 결과 목록(자기 자신 제외)',
    type: [CreateReservationResultDto],
  })
  results: CreateReservationResultDto[];

  constructor(
    currentUser: CreateReservationResultDto | null,
    results: CreateReservationResultDto[],
  ) {
    this.currentUser = currentUser;
    this.results = results;
  }
}
