import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseError } from 'firebase-admin';
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
      admin.initializeApp({
        credential: admin.credential.cert(
          (firebaseConfig as FirebaseConfigType)(),
        ),
      });
    }
  }

  async fcm(token: string, title: string, message: string) {
    const payload: Message = {
      token: token,
      notification: {
        title: title,
        body: message,
      },
    };

    try {
      const response = await admin.messaging().send(payload);
      return { sent_message: response };
    } catch (error) {
      if (error instanceof FirebaseError) {
        return {
          error: error.code,
          message: error.message,
        };
      }
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        return {
          error: (error as { code: string }).code,
          message: (error as { message: string }).message,
        };
      }
      return { error: 'UNKNOWN_ERROR', message: (error as Error).message };
    }
  }

  async multiFcm(
    tokens: string[],
    title: string,
    message: string,
  ): Promise<any> {
    const payload: MulticastMessage = {
      tokens,
      notification: {
        title: title,
        body: message,
      },
    };
    if (tokens.length === 0) {
      return { error: 'Tokens are empty' };
    }

    try {
      const result = await admin.messaging().sendEachForMulticast(payload);
      return result;
    } catch (error) {
      if (error instanceof FirebaseError) {
        return {
          error: error.code,
          message: error.message,
        };
      }
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        return {
          error: (error as { code: string }).code,
          message: (error as { message: string }).message,
        };
      }
      return { error: 'UNKNOWN_ERROR', message: (error as Error).message };
    }
  }
}
