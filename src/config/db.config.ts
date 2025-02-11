import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

const ENV = process.env.NODE_ENV;

config({ path: `.env.${ENV}` });

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'postgres',
  autoLoadEntities: true,
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  migrationsTableName: 'migrations',
  // synchronize: process.env.NODE_ENV === 'development',
  synchronize: true,
  // logging: process.env.NODE_ENV === 'development',
};
