import { config } from 'dotenv';
import { join } from 'path';
import { cwd } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getAppModeEnv } from '@/common';

const appMode = process.env.APP_MODE ?? 'dev';

if (appMode === 'dev') {
  config({
    path: getAppModeEnv(),
  });
}

const isDev = appMode === 'dev';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'mashup_node',
  synchronize: isDev,
  logging: isDev,
  entities: [join(cwd(), 'dist', '**', `*.entity.js`)],
  migrations: [join(cwd(), 'dist', 'migrations', '*.js')],
};

export const AppDataSourceConfig = new DataSource(typeormConfig);
