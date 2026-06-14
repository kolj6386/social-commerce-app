import { Module } from '@nestjs/common'
import { CommentModule } from '../comment/comment.module'
import { PostModule } from '../post/post.module'
import { AdminController } from './admin.controller'
import { ShopifyAdminGuard } from './shopify-admin.guard'

@Module({
  imports: [PostModule, CommentModule],
  controllers: [AdminController],
  providers: [ShopifyAdminGuard],
})
export class AdminModule {}
