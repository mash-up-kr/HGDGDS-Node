import { ApiProperty } from '@nestjs/swagger';
import { ReservationMemberDto } from '../reservation-member.dto';
import { UserReservationNotFoundException } from '@/common/exception/reservation.exception';

export class GetReservationMemberResponse {
  @ApiProperty({
    description: '예약 멤버 목록',
    type: [ReservationMemberDto],
    isArray: true,
  })
  members: ReservationMemberDto[];

  @ApiProperty({
    description: '예약 호스트 정보',
    type: ReservationMemberDto,
  })
  me: ReservationMemberDto;

  @ApiProperty({
    description: '멤버 수',
    example: 5,
    type: Number,
  })
  totalCount: number;

  constructor(members: ReservationMemberDto[], currentUserId: number) {
    const foundMember = members.find(
      (member) => member.userId === currentUserId,
    );
    if (!foundMember) {
      throw new UserReservationNotFoundException();
    }
    this.me = foundMember;

    // 현재 사용자 제외
    this.members = members.filter((member) => member.userId !== currentUserId);
    this.totalCount = members.length;
  }
}
