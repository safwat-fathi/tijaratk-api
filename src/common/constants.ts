const CONSTANTS = {
  AUTH: {
    JWT: 'jwt',
    FACEBOOK: 'facebook',
  },
  ACCESS_TOKEN: 'access_token',
  SESSION: {
    // EXPIRATION_TIME: 1000 * 60 * 60 * 24, // 1 day
    EXPIRATION_TIME: 10 * 60 * 1000, // 10 minutes
    REFRESH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
};

export default CONSTANTS;
