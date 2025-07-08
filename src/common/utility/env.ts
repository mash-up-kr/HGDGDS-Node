export function getAppModeEnv() {
  const appMode = process.env.APP_MODE ?? 'dev';
  return `${appMode}.env`;
}

export function getAppMode() {
  const appMode = process.env.APP_MODE ?? 'dev';
  return appMode;
}
