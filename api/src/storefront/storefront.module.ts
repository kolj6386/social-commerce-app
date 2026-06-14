import { Module } from '@nestjs/common'
import { ShopifyAppProxyGuard } from '../auth/shopify-app-proxy.guard'
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard'
import { RateLimitModule } from '../common/rate-limit/rate-limit.module'
import { CommentModule } from '../comment/comment.module'
import { PostModule } from '../post/post.module'
import { ReactionModule } from '../reaction/reaction.module'
import { StorefrontCommentController } from './storefront-comment.controller'
import { StorefrontPostController } from './storefront-post.controller'
import { StorefrontReactionController } from './storefront-reaction.controller'

@Module({
  imports: [PostModule, CommentModule, ReactionModule, RateLimitModule],
  controllers: [
    StorefrontPostController,
    StorefrontCommentController,
    StorefrontReactionController,
  ],
  providers: [ShopifyAppProxyGuard, RateLimitGuard],
})
export class StorefrontModule {}
