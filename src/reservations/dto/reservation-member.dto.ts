import { ProfileImageCode } from '@/common/enums/profile-image-code';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { ApiProperty } from '@nestjs/swagger';
import { UserReservation } from '../entities/user-reservation.entity';

export class ReservationMemberDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '김파디',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 코드',
    example: ProfileImageCode.PURPLE,
    enum: ProfileImageCode,
  })
  profileImageCode: ProfileImageCode;

  @ApiProperty({
    description: '참가자의 예약 상태',
    example: UserReservationStatus.DEFAULT,
    enum: UserReservationStatus,
  })
  status: UserReservationStatus;

  @ApiProperty({
    description: '호스트(마스터) 여부',
    example: false,
  })
  isHost: boolean;

  constructor(userReservation: UserReservation, hostId: number) {
    this.userId = userReservation.user.id;
    this.nickname = userReservation.user.nickname;
    this.profileImageCode = userReservation.user.profileImageCode;
    this.status = userReservation.status;
    this.isHost = userReservation.user.id == hostId;
  }
}
