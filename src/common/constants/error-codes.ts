export const ERROR_CODES = {
  // 인증 관련 (1000번대)
  USER_NOT_FOUND: {
    code: 1000,
    message: '사용자를 찾을 수 없습니다.',
  },
  DUPLICATE_DEVICE: {
    code: 1001,
    message: '이미 등록된 디바이스입니다.',
  },
  VALIDATION_FAILED: {
    code: 1002,
    message: '유효성 검사에 실패했습니다.',
  },
  INVALID_TOKEN: {
    code: 1003,
    message: '유효하지 않은 토큰입니다.',
  },
  INVALID_NICKNAME_FORMAT: {
    code: 1004,
    message: '닉네임 형식이 올바르지 않습니다.',
  },
  DUPLICATE_NICKNAME: {
    code: 1005,
    message: '이미 사용 중인 닉네임입니다.',
  },
  FORBIDDEN: {
    code: 1008,
    message: '접근 권한이 없습니다.',
  },
  // 예약 관련 (2000번대)
  RESERVATION_NOT_FOUND: {
    code: 2000,
    message: '예약을 찾을 수 없습니다.',
  },
  RESERVATION_FULL: {
    code: 2001,
    message: '예약이 마감되었습니다.',
  },
  INVALID_RESERVATION_TIME: {
    code: 2002,
    message: '유효하지 않은 예약 시간입니다.',
  },
  INVALID_CATEGORY: {
    code: 2003,
    message: '유효하지 않은 카테고리입니다.',
  },
  INVALID_SIMILAR_GROUP: {
    code: 2004,
    message: '유효하지 않은 유사 그룹입니다.',
  },
  TOO_MANY_IMAGES: {
    code: 2005,
    message: '이미지 개수가 너무 많습니다.',
  },
  ALREADY_JOINED: {
    code: 2006,
    message: '이미 참여한 예약입니다.',
  },
  RESERVATION_EXPIRED: {
    code: 2007,
    message: '예약이 만료되었습니다.',
  },
  HOST_CANNOT_JOIN: {
    code: 2008,
    message: '호스트는 자신의 예약에 참여할 수 없습니다.',
  },
  RESERVATION_ACCESS_DENIED: {
    code: 2009,
    message: '예약에 접근할 권한이 없습니다.',
  },
  RESERVATION_NOT_STARTED: {
    code: 2010,
    message: '예약이 아직 시작되지 않았습니다.',
  },
  RESERVATION_ALREADY_ENDED: {
    code: 2011,
    message: '예약이 이미 종료되었습니다.',
  },
  INVALID_RESERVATION_STATUS: {
    code: 2012,
    message: '유효하지 않은 예약 상태입니다.',
  },
  NO_EDIT_PERMISSION: {
    code: 2013,
    message: '수정 권한이 없습니다.',
  },
  CANNOT_EDIT_STARTED: {
    code: 2014,
    message: '시작된 예약은 수정할 수 없습니다.',
  },
  INVALID_TIME_UPDATE: {
    code: 2015,
    message: '유효하지 않은 시간 수정입니다.',
  },

  // 시스템 에러 (9000번대)
  INTERNAL_SERVER_ERROR: {
    code: 9000,
    message: '내부 서버 오류가 발생했습니다.',
  },
  // 테스트 에러
  TEST_EXCEPTION: {
    code: 1101,
    message: '테스트용 예외입니다. 노드팀 화이팅!',
  },
} as const;
