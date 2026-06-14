import { Body, Controller, Delete, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { Shop } from '../auth/shop.decorator'
import { ShopifyAppProxyGuard } from '../auth/shopify-app-proxy.guard'
import { ApiResponse } from '../common/api-response'
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard'
import { CommentService } from '../comment/comment.service'
import { CreateCommentQueryDto } from '../comment/dto/create-comment-query.dto'
import { DeleteCommentQueryDto } from '../comment/dto/delete-comment-query.dto'
import { EditCommentDto } from '../comment/dto/edit-comment.dto'
import { PostService } from '../post/post.service'

@Controller('shopify-proxy/comment')
@UseGuards(ShopifyAppProxyGuard, RateLimitGuard)
export class StorefrontCommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
  ) {}

  @Post('post')
  async createCommentOnPost(@Query() query: CreateCommentQueryDto, @Shop() shop: string) {
    const post = await this.postService.getById(query.postId, shop)

    if (!post) {
      return new ApiResponse({
        success: false,
        message: 'Post does not exist',
      })
    }

    try {
      const commentModel = this.commentService.createFromQuery(query, shop)
      const comment = await this.commentService.createCommentOnPost(commentModel)

      return new ApiResponse({
        success: true,
        message: 'Comment added successfully',
        data: { postId: comment.postId, id: comment.id },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return new ApiResponse({
        success: false,
        message: 'An unexpected error occurred',
        data: message,
      })
    }
  }

  @Patch('edit')
  async editComment(@Body() dto: EditCommentDto, @Shop() shop: string) {
    const comment = await this.commentService.editComment(dto, shop)

    if (!comment) {
      return new ApiResponse({
        success: false,
        message: 'Comment not found or comment does not belong to user Id',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Comment edited successfully',
      data: { id: comment.id, content: comment.content },
    })
  }

  @Delete('delete')
  async deleteComment(@Query() query: DeleteCommentQueryDto, @Shop() shop: string) {
    const comment = await this.commentService.deleteComment(query, shop)

    if (!comment) {
      return new ApiResponse({
        success: false,
        message: 'Comment not found or not authorized to delete',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Comment deleted successfully',
      data: { id: comment.id, userId: comment.userId },
    })
  }
}
