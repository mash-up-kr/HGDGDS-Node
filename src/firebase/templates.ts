export const FCM_TEMPLATES = {
  KOK: {
    title: (nickname: string) => `${nickname}님이 콕 찔렀어요`,
    message: (reservationTitle: string) =>
      `${reservationTitle} 예약을 준비하세요`,
  },
  IM_READY: {
    title: (nickname: string) => `${nickname}님이 준비를 완료했어요`,
    message: (nickname: string, reservationTitle: string) =>
      `'${nickname}'님이 '${reservationTitle}'예약에 참여할 준비를 완료했어요!`,
  },
};
