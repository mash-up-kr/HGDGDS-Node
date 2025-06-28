// sendNotification 성공 시 응답 인터페이스
import { BatchResponse } from 'firebase-admin/lib/messaging';

export interface SendNotificationResponse {
  sent_message: string;
}

// FCM 발송 작업에서 발생할 수 있는 에러 응답 인터페이스
export interface FirebaseOperationError {
  error: number;
  message: string;
}

// sendNotification 메소드의 성공 또는 에러 응답을 모두 나타내는 통합 타입
export type SendNotificationResult =
  | SendNotificationResponse
  | FirebaseOperationError;

// sendMulticastNotification의 반환 타입을 위한 DTO
export interface MulticastSendResult {
  responses: BatchResponse[];
  successCount: number;
  failureCount: number;
}

export type MulticastNotificationResult =
  | MulticastSendResult
  | FirebaseOperationError;
