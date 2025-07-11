import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import { Reservation } from './entities/reservation.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { FCM_TEMPLATES } from '../firebase/templates';

/**
 * 알림 유형
 */
export enum NotificationType {
  ONE_HOUR_BEFORE = 'ONE_HOUR_BEFORE',
  THIRTY_MIN_BEFORE = 'THIRTY_MIN_BEFORE',
  FIVE_MIN_BEFORE = 'FIVE_MIN_BEFORE',
  FIVE_MIN_AFTER = 'FIVE_MIN_AFTER',
}

/**
 * 알림 대상 정보
 */
export interface NotificationTarget {
  userId: number;
  reservationId: number;
  reservationTitle: string;
  fcmToken: string;
  userName: string;
  notificationType: NotificationType;
}

/**
 * 알림 타이밍 상수 (분 단위)
 */
export enum NotificationTiming {
  ONE_HOUR = 60,
  THIRTY_MINUTES = 30,
  FIVE_MINUTES = 5,
  FIVE_MINUTES_AFTER = -5,
}

/**
 * 예약 알림 서비스
 * 매분마다 예약 시간 1시간 전, 30분 전, 5분 전, 5분 후 알림을 발송합니다.
 */
@Injectable()
export class ReservationNotificationService {
  private readonly logger = new Logger(ReservationNotificationService.name);

  /**
   * 중복 알림 방지를 위한 메모리 캐시
   * Key: `${reservationId}_${userId}_${notificationType}`
   */
  private readonly sentNotifications = new Set<string>();

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(UserReservation)
    private readonly userReservationRepository: Repository<UserReservation>,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * 알림 설정 정보
   */
  private readonly notificationConfigs = [
    {
      type: NotificationType.ONE_HOUR_BEFORE,
      targetMinutes: NotificationTiming.ONE_HOUR,
      logMessage: '1시간 전 알림',
    },
    {
      type: NotificationType.THIRTY_MIN_BEFORE,
      targetMinutes: NotificationTiming.THIRTY_MINUTES,
      logMessage: '30분 전 알림',
    },
    {
      type: NotificationType.FIVE_MIN_BEFORE,
      targetMinutes: NotificationTiming.FIVE_MINUTES,
      logMessage: '5분 전 알림',
    },
    {
      type: NotificationType.FIVE_MIN_AFTER,
      targetMinutes: NotificationTiming.FIVE_MINUTES_AFTER,
      logMessage: '예약 5분 후 결과 입력 알림',
    },
  ];

  /**
   * 매분마다 실행되는 예약 알림 cron job
   */
  @Cron('* * * * *')
  async sendReservationNotifications(): Promise<void> {
    try {
      this.logger.log('예약 알림 확인을 시작합니다');

      const now = new Date();

      // 모든 알림 타입을 순차 처리
      for (const config of this.notificationConfigs) {
        await this.processNotificationsByType(now, config);
      }

      this.logger.log('예약 알림 확인을 완료했습니다');
    } catch (error) {
      this.logger.error('예약 알림 발송 중 오류가 발생했습니다', error);
    }
  }

  /**
   * 통합된 알림 처리 함수 (정확한 시간 기반)
   */
  private async processNotificationsByType(
    now: Date,
    config: {
      type: NotificationType;
      targetMinutes: number;
      logMessage: string;
    },
  ): Promise<void> {
    const targetTime = new Date(
      now.getTime() + config.targetMinutes * 60 * 1000,
    );

    // 해당 분(minute)의 00초~59초 범위로 정확한 조회
    const startTime = new Date(
      targetTime.getFullYear(),
      targetTime.getMonth(),
      targetTime.getDate(),
      targetTime.getHours(),
      targetTime.getMinutes(),
      0, // 00초
      0,
    );

    const endTime = new Date(
      targetTime.getFullYear(),
      targetTime.getMonth(),
      targetTime.getDate(),
      targetTime.getHours(),
      targetTime.getMinutes(),
      59, // 59초
      999,
    );

    const reservations = await this.findReservations(startTime, endTime);
    const targets = await this.createNotificationTargetsForType(
      reservations,
      config.type,
    );

    if (targets.length > 0) {
      await this.sendNotificationsInParallel(targets);
      this.logger.log(
        `${config.logMessage} ${targets.length}개를 발송했습니다`,
      );
    }
  }

  /**
   * 예약 조회
   */
  private async findReservations(
    minTime: Date,
    maxTime: Date,
  ): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: {
        reservationDatetime: Between(minTime, maxTime),
      },
      relations: ['host'],
    });
  }

  /**
   * 특정 타입의 알림 대상 생성
   */
  private async createNotificationTargetsForType(
    reservations: Reservation[],
    notificationType: NotificationType,
  ): Promise<NotificationTarget[]> {
    const targets: NotificationTarget[] = [];

    for (const reservation of reservations) {
      const reservationTargets = await this.createNotificationTargets(
        reservation,
        notificationType,
      );
      targets.push(...reservationTargets);
    }

    return targets;
  }

  /**
   * 예약의 알림 대상을 생성합니다
   * UserReservation을 통해 모든 참여자(호스트 포함)를 한번에 처리
   */
  private async createNotificationTargets(
    reservation: Reservation,
    notificationType: NotificationType,
  ): Promise<NotificationTarget[]> {
    const targets: NotificationTarget[] = [];

    // 예약 참여자들 알림 (호스트 포함, UserReservation을 통해 조회)
    const userReservations = await this.userReservationRepository.find({
      where: {
        reservation: { id: reservation.id },
      },
      relations: ['user'],
    });

    for (const userReservation of userReservations) {
      if (userReservation.user?.fcmToken) {
        const cacheKey = `${reservation.id}_${userReservation.user.id}_${notificationType}`;
        if (!this.sentNotifications.has(cacheKey)) {
          targets.push({
            userId: userReservation.user.id,
            reservationId: reservation.id,
            reservationTitle: reservation.title,
            fcmToken: userReservation.user.fcmToken,
            userName: userReservation.user.nickname,
            notificationType,
          });
        }
      }
    }

    return targets;
  }

  /**
   * 병렬로 알림을 발송합니다
   */
  private async sendNotificationsInParallel(
    targets: NotificationTarget[],
  ): Promise<void> {
    const promises = targets.map((target) =>
      this.sendSingleNotification(target),
    );
    await Promise.allSettled(promises);
  }

  /**
   * 개별 알림을 발송합니다
   */
  private async sendSingleNotification(
    target: NotificationTarget,
  ): Promise<void> {
    try {
      const cacheKey = `${target.reservationId}_${target.userId}_${target.notificationType}`;

      const { title, body } = this.getNotificationContent(
        target.reservationTitle,
        target.notificationType,
      );

      await this.firebaseService.sendNotification(target.fcmToken, title, body);

      // 캐시에 저장하여 중복 발송 방지
      this.sentNotifications.add(cacheKey);

      const notificationTypeText = this.getNotificationTypeText(
        target.notificationType,
      );
      this.logger.log(
        `${target.userName}님에게 ${notificationTypeText} 알림을 발송했습니다 (예약ID: ${target.reservationId})`,
      );
    } catch (error) {
      const notificationTypeText = this.getNotificationTypeText(
        target.notificationType,
      );
      this.logger.error(
        `${target.userName}님에게 ${notificationTypeText} 알림 발송이 실패했습니다 (예약ID: ${target.reservationId})`,
        error,
      );
    }
  }

  /**
   * 알림 내용 생성 (FCM 템플릿 활용)
   */
  private getNotificationContent(
    reservationTitle: string,
    notificationType: NotificationType,
  ): { title: string; body: string } {
    switch (notificationType) {
      case NotificationType.ONE_HOUR_BEFORE:
        return {
          title:
            FCM_TEMPLATES.RESERVATION_ONE_HOUR_BEFORE.title(reservationTitle),
          body: FCM_TEMPLATES.RESERVATION_ONE_HOUR_BEFORE.message(
            reservationTitle,
          ),
        };

      case NotificationType.THIRTY_MIN_BEFORE:
        return {
          title:
            FCM_TEMPLATES.RESERVATION_THIRTY_MIN_BEFORE.title(reservationTitle),
          body: FCM_TEMPLATES.RESERVATION_THIRTY_MIN_BEFORE.message(
            reservationTitle,
          ),
        };

      case NotificationType.FIVE_MIN_BEFORE:
        return {
          title:
            FCM_TEMPLATES.RESERVATION_FIVE_MIN_BEFORE.title(reservationTitle),
          body: FCM_TEMPLATES.RESERVATION_FIVE_MIN_BEFORE.message(
            reservationTitle,
          ),
        };

      case NotificationType.FIVE_MIN_AFTER:
        return {
          title:
            FCM_TEMPLATES.RESERVATION_RESULT_REQUEST.title(reservationTitle),
          body: FCM_TEMPLATES.RESERVATION_RESULT_REQUEST.message(),
        };

      default:
        return {
          title: '예약 알림',
          body: '예약 관련 알림입니다.',
        };
    }
  }

  /**
   * 알림 타입 텍스트 반환
   */
  private getNotificationTypeText(notificationType: NotificationType): string {
    switch (notificationType) {
      case NotificationType.ONE_HOUR_BEFORE:
        return '1시간 전';
      case NotificationType.THIRTY_MIN_BEFORE:
        return '30분 전';
      case NotificationType.FIVE_MIN_BEFORE:
        return '5분 전';
      case NotificationType.FIVE_MIN_AFTER:
        return '5분 후 결과 입력';
      default:
        return '알 수 없음';
    }
  }
}
