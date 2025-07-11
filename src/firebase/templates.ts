export const FCM_TEMPLATES = {
  KOK: {
    title: (nickname: string) => `${nickname}님이 콕 찔렀어요.`,
    message: (reservationTitle: string) =>
      `${reservationTitle} 예약을 준비하세요`,
  },
  IM_READY: {
    title: (nickname: string) => `${nickname}님이 준비를 완료했어요.`,
    message: (nickname: string, reservationTitle: string) =>
      `'${nickname}'님이 '${reservationTitle}'예약에 참여할 준비를 완료했어요!`,
  },
  RESERVATION_ONE_HOUR_BEFORE: {
    title: (reservationTitle: string) => `'${reservationTitle}' 예약까지 1시간`,
    message: (reservationTitle: string) =>
      `'${reservationTitle}' 예약까지 1시간 남았어요. 준비 상태를 업데이트하세요.`,
  },
  RESERVATION_THIRTY_MIN_BEFORE: {
    title: (reservationTitle: string) => `'${reservationTitle}' 예약까지 30분`,
    message: (reservationTitle: string) =>
      `'${reservationTitle}' 예약까지 30분 남았어요. 예약 준비를 시작하세요!`,
  },
  RESERVATION_FIVE_MIN_BEFORE: {
    title: (reservationTitle: string) => `'${reservationTitle}' 예약까지 5분`,
    message: (reservationTitle: string) =>
      `'${reservationTitle}' 예약까지 5분 남았어요. 서둘러 예약을 준비하세요!`,
  },
  RESERVATION_RESULT_REQUEST: {
    title: (reservationTitle: string) =>
      `'${reservationTitle}' 결과는 어땠나요?`,
    message: () => `예약 결과를 입력해 주세요.`,
  },
};
