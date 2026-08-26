import { Module } from '@nestjs/common'
import { CommentModule } from '../comment/comment.module'
import { PostModule } from '../post/post.module'
import { ShopModule } from '../shop/shop.module'
import { AdminController } from './admin.controller'
import { ShopifyAdminGuard } from './shopify-admin.guard'

@Module({
  imports: [PostModule, CommentModule, ShopModule],
  controllers: [AdminController],
  providers: [ShopifyAdminGuard],
})
export class AdminModule {}
