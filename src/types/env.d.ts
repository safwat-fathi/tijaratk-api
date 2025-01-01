declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      HTTP_SERVER_PORT: number;
      DB_NAME: string;
      DB_USER: string;
      DB_PASS: string;
      DB_HOST: string;
      DB_PORT: number;
      DEV_APP_URL: string;
      PROD_APP_URL: string;
      JWT_SECRET: string;
      CSRF_SECRET: string;
    }
  }
}

export {};
