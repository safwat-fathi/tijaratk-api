import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'postgres',
  entities: [`${__dirname}/src/**/*.entity{.ts,.js}`],
  // entities: [`dist/**/*.entity.js`],
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  migrationsTableName: 'migrations',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});
