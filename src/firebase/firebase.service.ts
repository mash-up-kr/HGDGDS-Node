import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  Message,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import firebaseConfig from '@/firebase/firebase.config';

@Injectable()
export class FirebaseService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
    });
  }

  async fcm(token: string, title: string, message: string) {
    const payload: Message = {
      token: token,
      notification: {
        title: title,
        body: message,
      },
    };

    const result = await admin
      .messaging()
      .send(payload)
      .then((response) => {
        return { sent_message: response };
      })
      .catch((error) => {
        return { error: error.code };
      });
    return result;
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
    if (tokens.length === 0) return { error: 'Tokens are empty' };

    const result = await admin.messaging().sendEachForMulticast(payload);
    return result;
  }
}
