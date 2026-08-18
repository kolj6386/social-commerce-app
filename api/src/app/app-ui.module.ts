import { Module } from '@nestjs/common'
import { ShopModule } from '../shop/shop.module'
import { AppUiController } from './app-ui.controller'

@Module({
  imports: [ShopModule],
  controllers: [AppUiController],
})
export class AppUiModule {}
