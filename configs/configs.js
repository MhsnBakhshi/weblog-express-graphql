export default {
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
  },

  port: parseInt(process.env.PORT) || 4004,

  auth: {
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    accessTokenExpiresInSeconds: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshTokenExpiresInSeconds: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  },
  FarazSmsPanel: {
    user: process.env.FARAZSMSUSER,
    pass: process.env.FARAZSMSPASSWORD,
    fromNum: process.env.FARAZSMSNUMBER,
    patternCode: process.env.FARAZSMSPATTERNCODE,
  },

  redis: {
    uri: process.env.REDIS_URI,
  },

  isProduction: process.env.NODE_ENV === "production",

  domain: process.env.DOMAIN,
};
