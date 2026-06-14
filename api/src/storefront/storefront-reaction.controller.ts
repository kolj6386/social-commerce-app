import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common'
import { Shop } from '../auth/shop.decorator'
import { ShopifyAppProxyGuard } from '../auth/shopify-app-proxy.guard'
import { ApiResponse } from '../common/api-response'
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard'
import {
  CreateCommentReactionDto,
  CreateReactionDto,
  DeleteCommentReactionDto,
  DeleteReactionDto,
} from '../reaction/dto/create-reaction.dto'
import { ReactionService } from '../reaction/reaction.service'

@Controller('shopify-proxy/reaction')
@UseGuards(ShopifyAppProxyGuard, RateLimitGuard)
export class StorefrontReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  async createReactionOnPost(@Body() dto: CreateReactionDto, @Shop() shop: string) {
    const success = await this.reactionService.createReactionOnPost(dto, shop)
    if (!success) {
      return new ApiResponse({
        success: false,
        message: 'Post does not exist',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Reaction added successfully',
      data: { postId: dto.postId },
    })
  }

  @Post('comment-reaction')
  async createReactionOnComment(@Body() dto: CreateCommentReactionDto, @Shop() shop: string) {
    const success = await this.reactionService.createReactionOnComment(dto, shop)
    if (!success) {
      return new ApiResponse({
        success: false,
        message: 'Comment does not exist',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Reaction added successfully',
      data: { commentId: dto.commentId },
    })
  }

  @Delete()
  async deletePostReaction(@Body() dto: DeleteReactionDto, @Shop() shop: string) {
    const success = await this.reactionService.deleteReactionOnPost(dto, shop)
    if (!success) {
      return new ApiResponse({
        success: false,
        message: 'Could not delete reaction on post, post may not exist',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Reaction deleted successfully',
      data: { postId: dto.postId },
    })
  }

  @Delete('comment-reaction')
  async deleteCommentReaction(@Body() dto: DeleteCommentReactionDto, @Shop() shop: string) {
    const success = await this.reactionService.deleteReactionOnComment(dto, shop)
    if (!success) {
      return new ApiResponse({
        success: false,
        message: 'Could not delete reaction on comment, comment may not exist',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Reaction deleted successfully',
      data: { commentId: dto.commentId },
    })
  }
}
