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
      'https://invasive-marie-uneradicative.ngrok-free.dev/auth/shopify/callback',
    backendUrl:
      process.env.SHOPIFY_BACKEND_URL ?? 'https://invasive-marie-uneradicative.ngrok-free.dev',
    // Frontend UI (Cloud Run) — proxied via GET /app on the backend.
    appUrl:
      process.env.SHOPIFY_APP_URL ??
      'https://social-commerce-service-916238980094.us-central1.run.app',
    appUiPath: process.env.SHOPIFY_APP_UI_PATH ?? '/app',
    /** App handle used in admin billing URLs (`/charges/{handle}/pricing_plans`). */
    appHandle: process.env.SHOPIFY_APP_HANDLE ?? 'social-commerce-public-dev',
    adminApiVersion: process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-10',
    partner: {
      orgId: process.env.SHOPIFY_PARTNER_ORG_ID,
      accessToken: process.env.SHOPIFY_PARTNER_ACCESS_TOKEN,
      /** Partner/App Pricing app GID, e.g. `gid://shopify/App/1234`. */
      appId: process.env.SHOPIFY_PARTNER_APP_ID,
      apiVersion: process.env.SHOPIFY_PARTNER_API_VERSION ?? '2026-07',
    },
  },
})
