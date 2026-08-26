import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiResponse } from '../common/api-response'
import { CommentService } from '../comment/comment.service'
import { DeletePostBodyDto } from '../post/dto/delete-post.dto'
import { PostReviewDto } from '../post/dto/post-review.dto'
import { UnapprovedPostsQueryDto } from '../post/dto/unapproved-posts-query.dto'
import { PostService } from '../post/post.service'
import { UpdateShopSettingsDto } from '../shop/dto/update-shop-settings.dto'
import { ShopService } from '../shop/shop.service'
import { AdminShop } from './admin-shop.decorator'
import { ShopifyAdminGuard } from './shopify-admin.guard'

@Controller('api/admin')
@UseGuards(ShopifyAdminGuard)
export class AdminController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly shopService: ShopService,
  ) {}

  @Get('settings')
  async getSettings(@AdminShop() shop: string) {
    const settings = await this.shopService.getSettings(shop)
    return new ApiResponse({
      success: true,
      message: 'Settings retrieved successfully',
      data: settings,
    })
  }

  @Put('settings')
  async updateSettings(@Body() dto: UpdateShopSettingsDto, @AdminShop() shop: string) {
    const settings = await this.shopService.updateSettings(shop, dto)

    if (!settings) {
      return new ApiResponse({
        success: false,
        message: 'Shop not found',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Settings saved successfully',
      data: settings,
    })
  }

  @Get('all')
  async getAllPostsAndCommentsForReview(
    @Query() query: UnapprovedPostsQueryDto,
    @AdminShop() shop: string,
  ) {
    try {
      const { posts, hasNextPage: hasNextPagePosts } = await this.postService.getUnapprovedPosts(
        query,
        shop,
      )
      const { comments, hasNextPage: hasNextPageComments } =
        await this.commentService.getUnapprovedComments(query, shop)

      return new ApiResponse({
        success: true,
        message: 'Data retrieved successfully',
        data: {
          posts: { items: posts, hasNextPage: hasNextPagePosts },
          comments: { items: comments, hasNextPage: hasNextPageComments },
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return new ApiResponse({
        success: false,
        message: 'An unexpected error occurred',
        errors: { Exception: [message] },
      })
    }
  }

  @Post('approve-post')
  async approvePost(@Body() dto: PostReviewDto) {
    const result = await this.postService.approveOrDisapprovePost(dto)

    if (!result) {
      return new ApiResponse({
        success: false,
        message: 'Post does not exist or could not be updated',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Post approved successfully',
    })
  }

  @Delete('delete')
  async deletePost(@Body() dto: DeletePostBodyDto) {
    const post = await this.postService.adminDeletePost(dto)

    if (!post) {
      return new ApiResponse({
        success: false,
        message: 'Post not found or not authorized to delete',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Post deleted successfully',
      data: { id: post.id, userId: post.userId },
    })
  }
}
