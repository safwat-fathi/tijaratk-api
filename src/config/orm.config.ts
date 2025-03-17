import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

const ENV = process.env.NODE_ENV;

config({ path: `.env.${ENV}` });

const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  migrationsTableName: process.env.MIGRATIONS_TABLE_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ...(process.env.NODE_ENV === 'production'
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
};

const dataSource = new DataSource(dbConfig);
export default dataSource;
