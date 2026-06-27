import { Module } from '@nestjs/common'
import { ShopModule } from '../shop/shop.module'
import { ShopifyAdminGuard } from '../admin/shopify-admin.guard'
import { AuthController } from './auth.controller'

@Module({
  imports: [ShopModule],
  controllers: [AuthController],
  providers: [ShopifyAdminGuard],
})
export class AuthModule {}
