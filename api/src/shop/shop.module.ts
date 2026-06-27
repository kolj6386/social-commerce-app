import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ShopService } from './shop.service'

@Module({
  imports: [DatabaseModule],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
