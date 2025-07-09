import { ReservationItemDto } from '@/docs/dto/reservation.dto';

const NAMES = [
  '이윤하',
  '김바다',
  '김아린',
  '김남수',
  '조재훈',
  '유지인',
  '신상우',
  '박병호',
  '이창환 (멧돼지)',
  '조혜온',
  '박서연',
  '허거덩거덩스',
  '화이팅',
  '최고다',
  '멋지다',
  '잘한다',
  '우승',
  '가자ㅏ',
];

const PROFILE_IMAGE_CODES = ['PURPLE', 'ORANGE', 'GREEN', 'BLUE', 'PINK'];

export const MOCK_RESERVATIONS: ReservationItemDto[] = Array.from({
  length: 30,
}).map((_, i) => {
  const name = NAMES[i % NAMES.length];
  const profileImageCodeList = Array.from({ length: 3 }).map(
    (_, idx) => PROFILE_IMAGE_CODES[(i + idx) % PROFILE_IMAGE_CODES.length],
  );
  return {
    reservationId: i + 1,
    title: name,
    category: 'ACTIVITY',
    reservationDatetime: `2025-07-${((i % 28) + 1).toString().padStart(2, '0')}T19:00:00+09:00`,
    participantCount: Math.floor(Math.random() * 20) + 1,
    maxParticipants: 20,
    hostId: (i % NAMES.length) + 1,
    hostNickname: name,
    images: [`path/image${(i % 3) + 1}.jpg`],
    userStatus: 'default',
    isHost: i % 2 === 0,
    profileImageCodeList: profileImageCodeList,
  };
});
