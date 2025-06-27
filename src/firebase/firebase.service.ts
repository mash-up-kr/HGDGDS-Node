import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

type FirebaseConfigType = () => admin.ServiceAccount;

@Injectable()
export class FirebaseService {
  constructor() {
    if (admin.apps.length === 0) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(
            (firebaseConfig as FirebaseConfigType)(),
          ),
        });
      } catch (error) {
        throw new InternalServerErrorException(
          'Firebase initialization failed',
        );
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
      return { error: 'BAD_REQUEST', message: 'Invalid FCM token provided.' };
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
    } catch (error: any) {
      return {
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred.',
      };
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<MulticastSendResult | FirebaseOperationError | BatchResponse> {
    const payload: MulticastMessage = {
      tokens,
      notification: {
        title: title,
        body: message,
      },
      ...(data && { data }),
    };
    if (tokens.length === 0) {
      return {
        error: 'EMPTY_TOKENS',
        message: 'Tokens are empty',
      };
    }

    try {
      const result = await admin.messaging().sendEachForMulticast(payload);
      return result;
    } catch (error: any) {
      return {
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred.',
      };
    }
  }
}
