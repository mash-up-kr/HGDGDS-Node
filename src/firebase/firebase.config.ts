export default () => {
  const firebaseConfigString = process.env.FIREBASE_CONFIG;

  if (!firebaseConfigString) {
    throw new Error('FIREBASE_CONFIG environment variable not found.');
  }

  try {
    const config = JSON.parse(firebaseConfigString);
    return config;
  } catch (error) {
    throw new Error('Failed to parse Firebase configuration.');
  }
};
