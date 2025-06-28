import {
  FirebaseConfigNotFoundException,
  FirebaseConfigParseException,
} from '@/firebase/exception/firebase.exception';

export default () => {
  const firebaseConfigString = process.env.FIREBASE_CONFIG;

  if (!firebaseConfigString) {
    throw new FirebaseConfigNotFoundException();
  }

  try {
    const config = JSON.parse(firebaseConfigString);
    return config;
  } catch (error) {
    throw new FirebaseConfigParseException();
  }
};
