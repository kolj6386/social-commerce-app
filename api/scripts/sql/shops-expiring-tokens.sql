-- Expiring offline access tokens: extra columns on "Shops".
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE "Shops" ADD COLUMN IF NOT EXISTS "RefreshToken" VARCHAR NULL;
ALTER TABLE "Shops" ADD COLUMN IF NOT EXISTS "AccessTokenExpiresAt" TIMESTAMP NULL;
ALTER TABLE "Shops" ADD COLUMN IF NOT EXISTS "RefreshTokenExpiresAt" TIMESTAMP NULL;