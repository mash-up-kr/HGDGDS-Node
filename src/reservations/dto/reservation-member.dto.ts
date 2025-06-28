import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { ApiProperty } from '@nestjs/swagger';

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
    description: '프로필 이미지 코드 (01-05)',
    example: '01',
    enum: ['01', '02', '03', '04', '05'],
  })
  profileImageCode: string;

  @ApiProperty({
    description: '참가자의 예약 상태',
    example: UserReservationStatus.DEFAULT,
    enum: UserReservationStatus,
  })
  status: string;

  @ApiProperty({
    description: '상태 메시지',
    example: '예약 내가 찢는다!',
    nullable: true,
  })
  statusMessage: string | null;

  @ApiProperty({
    description: '호스트(마스터) 여부',
    example: false,
  })
  isHost: boolean;
}
