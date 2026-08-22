import { Module } from '@nestjs/common'
import { PaidPlanGuard } from '../common/guards/paid-plan.guard'
import { DatabaseModule } from '../database/database.module'
import { ShopModule } from '../shop/shop.module'
import { PostController } from './post.controller'
import { PostService } from './post.service'

@Module({
  imports: [DatabaseModule, ShopModule],
  controllers: [PostController],
  providers: [PostService, PaidPlanGuard],
  exports: [PostService],
})
export class PostModule {}
