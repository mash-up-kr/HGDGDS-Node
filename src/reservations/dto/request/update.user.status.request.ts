import { ApiProperty } from '@nestjs/swagger';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { IsEnum } from 'class-validator';

const ALLOWED_STATUS = [
  UserReservationStatus.DEFAULT,
  UserReservationStatus.READY,
] as const;
type AllowedUserReservationStatus = (typeof ALLOWED_STATUS)[number];

export class UpdateUserStatusRequest {
  @ApiProperty({
    description: '예약 준비완료 여부',
    enum: ALLOWED_STATUS,
    enumName: 'AllowedUserReservationStatus',
    example: UserReservationStatus.READY,
    required: true,
  })
  @IsEnum(ALLOWED_STATUS, {
    message: `status는 ${ALLOWED_STATUS.join(', ')} 중 하나여야 합니다.`,
  })
  status: AllowedUserReservationStatus;
}
