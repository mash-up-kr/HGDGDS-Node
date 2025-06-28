import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  Message,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import firebaseConfig from '@/firebase/firebase.config';
import {
  SendNotificationResponse,
  FirebaseOperationError,
  MulticastSendResult,
} from '@/firebase/dto/firebase-notification.dto';
import { BatchResponse } from 'firebase-admin/lib/messaging';
import { ERROR_CODES } from '@/common/constants/error-codes';

interface FirebaseError {
  code?: string;
  message: string;
}

@Injectable()
export class FirebaseService {
  constructor() {
    if (admin.apps.length === 0) {
      try {
        const serviceAccount = firebaseConfig();
        if (
          !serviceAccount ||
          typeof serviceAccount !== 'object' ||
          !serviceAccount.private_key
        ) {
          throw new Error(ERROR_CODES.INVALID_SERVICE_ACCOUNT.message);
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        throw new Error(ERROR_CODES.FIREBASE_INITIALIZATION_FAILED.message);
      }
    }
  }

  async sendNotification(
    token: string,
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<SendNotificationResponse | FirebaseOperationError> {
    if (!token || typeof token !== 'string') {
      return {
        error: ERROR_CODES.INVALID_FCM_TOKEN.code,
        message: ERROR_CODES.INVALID_FCM_TOKEN.message,
      };
    }

    const payload: Message = {
      token: token,
      notification: {
        title: title,
        body: message,
      },
      ...(data && { data }),
    };

    try {
      const response = await admin.messaging().send(payload);
      return { sent_message: response };
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code) {
        if (
          firebaseError.code === 'messaging/invalid-registration-token' ||
          firebaseError.code === 'messaging/registration-token-not-registered'
        ) {
          return {
            error: ERROR_CODES.INVALID_FCM_TOKEN.code,
            message: ERROR_CODES.INVALID_FCM_TOKEN.message,
          };
        }

        if (
          firebaseError.code === 'messaging/third-party-auth-error' ||
          firebaseError.code === 'messaging/authentication-error'
        ) {
          return {
            error: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.code,
            message: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.message,
          };
        }
      }

      return {
        error: ERROR_CODES.NOTIFICATION_SEND_FAILED.code,
        message: ERROR_CODES.NOTIFICATION_SEND_FAILED.message,
      };
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<MulticastSendResult | FirebaseOperationError | BatchResponse> {
    if (tokens.length === 0) {
      return {
        error: ERROR_CODES.EMPTY_TOKEN_LIST.code,
        message: ERROR_CODES.EMPTY_TOKEN_LIST.message,
      };
    }

    const payload: MulticastMessage = {
      tokens,
      notification: {
        title: title,
        body: message,
      },
      ...(data && { data }),
    };

    try {
      const result = await admin.messaging().sendEachForMulticast(payload);
      return result;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code) {
        if (
          firebaseError.code === 'messaging/third-party-auth-error' ||
          firebaseError.code === 'messaging/authentication-error'
        ) {
          return {
            error: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.code,
            message: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.message,
          };
        }
      }

      return {
        error: ERROR_CODES.NOTIFICATION_SEND_FAILED.code,
        message: ERROR_CODES.NOTIFICATION_SEND_FAILED.message,
      };
    }
  }
}
