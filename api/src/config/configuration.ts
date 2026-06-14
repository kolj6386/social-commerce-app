export default () => ({
  port: parseInt(process.env.PORT ?? '5120', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    instance: process.env.DB_INSTANCE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE ?? 'social-commerce',
    url: process.env.DATABASE_URL,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    validIssuer: process.env.SHOPIFY_VALID_ISSUER,
    validAudience: process.env.SHOPIFY_VALID_AUDIENCE,
    oauthRedirectUri:
      process.env.SHOPIFY_OAUTH_REDIRECT_URI ??
      'https://social-commerce.ngrok.app/auth/shopify/callback',
    appUrl: process.env.SHOPIFY_APP_URL ?? 'https://social-commerce.ngrok.app/app',
  },
})
