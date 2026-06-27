import { Module } from '@nestjs/common'
import { ShopModule } from '../shop/shop.module'
import { WebhookController } from './webhook.controller'

@Module({
  imports: [ShopModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
