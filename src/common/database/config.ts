import { config } from 'dotenv';
import { join } from 'path';
import { cwd } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

const appMode = process.env.APP_MODE ?? 'dev';

if (appMode === 'dev') {
  config({ path: join(cwd(), 'dev.env') });
}

export const isDev = appMode === 'dev';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  extra: {
    timezone: 'Asia/Seoul',
    options: `-c timezone=Asia/Seoul`,
  },
  ssl: isDev
    ? false
    : {
        rejectUnauthorized: false,
      },
  synchronize: isDev,
  logging: isDev,
  entities: [join(cwd(), 'dist', '**', `*.entity.js`)],
  migrations: [join(cwd(), 'dist', 'migrations', '*.js')],
};

const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
];
if (appMode === 'prod') {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `필수 환경변수 ${envVar}가 설정되지 않았습니다. 앱이 시작될 수 없습니다.`,
      );
    }
  }
}

export const AppDataSourceConfig = new DataSource(typeormConfig);
