export default () => ({
  port: parseInt(process.env.PORT ?? '5120', 10),
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
  /** Max comments nested under each post in feed list responses. */
  feedCommentsPerPost: parseInt(process.env.FEED_COMMENTS_PER_POST ?? '5', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    instance: process.env.DB_INSTANCE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE ?? 'social-commerce',
    url: process.env.DATABASE_URL,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    ssl: process.env.DB_SSL === 'true' || process.env.DATABASE_SSL === 'true',
  },
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    // Session token `aud` — usually same as API key. Issuer is derived per-shop from `dest`.
    validAudience: process.env.SHOPIFY_VALID_AUDIENCE ?? process.env.SHOPIFY_API_KEY,
    oauthRedirectUri: process.env.SHOPIFY_OAUTH_REDIRECT_URI,
    backendUrl: process.env.SHOPIFY_BACKEND_URL,
    appUrl: process.env.SHOPIFY_APP_URL,
    appUiPath: process.env.SHOPIFY_APP_UI_PATH ?? '/app',
    appHandle: process.env.SHOPIFY_APP_HANDLE ?? 'social-commerce-public-dev',
    adminApiVersion: process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-10',
    partner: {
      orgId: process.env.SHOPIFY_PARTNER_ORG_ID,
      accessToken: process.env.SHOPIFY_PARTNER_ACCESS_TOKEN,
      appId: process.env.SHOPIFY_PARTNER_APP_ID,
      apiVersion: process.env.SHOPIFY_PARTNER_API_VERSION ?? '2026-07',
    },
  },
})
