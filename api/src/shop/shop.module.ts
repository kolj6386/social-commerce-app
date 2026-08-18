import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PartnerApiService } from './partner-api.service'
import { ShopService } from './shop.service'

@Module({
  imports: [DatabaseModule],
  providers: [ShopService, PartnerApiService],
  exports: [ShopService, PartnerApiService],
})
export class ShopModule {}
