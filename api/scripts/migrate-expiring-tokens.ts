/**
 * Option 2 bulk migration: exchange legacy non-expiring offline tokens for expiring pairs.
 *
 * Usage (from api/):
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-expiring-tokens.ts
 */
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { ShopService } from '../src/shop/shop.service'

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })
  const shopService = app.get(ShopService)

  const result = await shopService.migrateAllLegacyOfflineTokens()
  console.log(JSON.stringify(result, null, 2))

  await app.close()
  process.exit(result.failed.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})