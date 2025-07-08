import {
  FirebaseConfigNotFoundException,
  FirebaseConfigParseException,
} from '@/common/exception/firebase.exception';

// Firebase 서비스 계정 타입 정의
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// 타입 가드 함수
function isValidServiceAccount(obj: unknown): obj is ServiceAccount {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const account = obj as Record<string, unknown>;

  return (
    typeof account.type === 'string' &&
    typeof account.project_id === 'string' &&
    typeof account.private_key_id === 'string' &&
    typeof account.private_key === 'string' &&
    typeof account.client_email === 'string' &&
    typeof account.client_id === 'string' &&
    typeof account.auth_uri === 'string' &&
    typeof account.token_uri === 'string' &&
    typeof account.auth_provider_x509_cert_url === 'string' &&
    typeof account.client_x509_cert_url === 'string'
  );
}

export default (): ServiceAccount => {
  const firebaseConfigString = process.env.FIREBASE_CONFIG;

  if (!firebaseConfigString) {
    throw new FirebaseConfigNotFoundException();
  }

  try {
    const config: unknown = JSON.parse(firebaseConfigString);

    if (!isValidServiceAccount(config)) {
      throw new FirebaseConfigParseException();
    }

    return config;
  } catch {
    throw new FirebaseConfigParseException();
  }
};
