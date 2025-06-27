import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  Message,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import firebaseConfig from '@/firebase/firebase.config';

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
        throw new Error('Firebase initialization failed');
      }
    }
  }

  async sendNotification(
    token: string,
    title: string,
    message: string,
    data?: Record<string, string>,
  ) {
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
      if (error && typeof error === 'object' && error.code && error.message) {
        return {
          error: error.code,
          message: error.message,
        };
      }
      return {
        error: 'UNKNOWN_ERROR',
        message: error?.message || 'An unknown error occurred.',
      };
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<any> {
    const payload: MulticastMessage = {
      tokens,
      notification: {
        title: title,
        body: message,
      },
      ...(data && { data }),
    };
    if (tokens.length === 0) {
      return { error: 'Tokens are empty' };
    }

    try {
      const result = await admin.messaging().sendEachForMulticast(payload);
      return result;
    } catch (error: any) {
      if (error && typeof error === 'object' && error.code && error.message) {
        return {
          error: error.code,
          message: error.message,
        };
      }
      return {
        error: 'UNKNOWN_ERROR',
        message: error?.message || 'An unknown error occurred.',
      };
    }
  }
}
