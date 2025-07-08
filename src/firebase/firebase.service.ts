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
} from '@/firebase/dto/firebase-notification.dto';
import { BatchResponse } from 'firebase-admin/lib/messaging';
import {
  InvalidServiceAccountException,
  FirebaseInitializationFailedException,
  InvalidFcmTokenException,
  FirebaseServiceUnavailableException,
  NotificationSendFailedException,
  EmptyTokenListException,
} from '@/common/exception/firebase.exception';

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
          throw new InvalidServiceAccountException();
        }
        admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
        });
      } catch (error) {
        if (error instanceof InvalidServiceAccountException) {
          throw error;
        }
        throw new FirebaseInitializationFailedException();
      }
    }
  }

  async sendNotification(
    token: string,
    title: string,
    message: string,
    url?: string,
  ): Promise<SendNotificationResponse | FirebaseOperationError> {
    if (!token || typeof token !== 'string') {
      throw new InvalidFcmTokenException();
    }

    const payload: Message = {
      token: token,
      notification: {
        title: title,
        body: message,
      },
      ...(url && { url }),
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
          throw new InvalidFcmTokenException();
        }

        if (
          firebaseError.code === 'messaging/third-party-auth-error' ||
          firebaseError.code === 'messaging/authentication-error'
        ) {
          throw new FirebaseServiceUnavailableException();
        }
      }

      throw new NotificationSendFailedException();
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    title: string,
    message: string,
    url?: string,
  ): Promise<BatchResponse> {
    if (tokens.length === 0) {
      throw new EmptyTokenListException();
    }

    const payload: MulticastMessage = {
      tokens,
      notification: {
        title: title,
        body: message,
      },
      ...(url && { url }),
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
          throw new FirebaseServiceUnavailableException();
        }
      }

      throw new NotificationSendFailedException();
    }
  }
}
