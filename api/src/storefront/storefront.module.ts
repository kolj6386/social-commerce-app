import { Module } from '@nestjs/common'
import { ShopifyAppProxyGuard } from '../auth/shopify-app-proxy.guard'
import { PaidPlanGuard } from '../common/guards/paid-plan.guard'
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard'
import { RateLimitModule } from '../common/rate-limit/rate-limit.module'
import { CommentModule } from '../comment/comment.module'
import { PostModule } from '../post/post.module'
import { ReactionModule } from '../reaction/reaction.module'
import { ShopModule } from '../shop/shop.module'
import { StorefrontCommentController } from './storefront-comment.controller'
import { StorefrontPostController } from './storefront-post.controller'
import { StorefrontReactionController } from './storefront-reaction.controller'
import { StorefrontSettingsController } from './storefront-settings.controller'

@Module({
  imports: [PostModule, CommentModule, ReactionModule, RateLimitModule, ShopModule],
  controllers: [
    StorefrontPostController,
    StorefrontCommentController,
    StorefrontReactionController,
    StorefrontSettingsController,
  ],
  providers: [ShopifyAppProxyGuard, RateLimitGuard, PaidPlanGuard],
})
export class StorefrontModule {}
