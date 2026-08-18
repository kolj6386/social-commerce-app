import { Module } from '@nestjs/common'
import { ShopModule } from '../shop/shop.module'
import { ComplianceWebhookController } from './compliance-webhook.controller'
import { WebhookController } from './webhook.controller'

@Module({
  imports: [ShopModule],
  controllers: [WebhookController, ComplianceWebhookController],
})
export class WebhookModule {}
