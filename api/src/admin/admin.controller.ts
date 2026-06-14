import { Body, Controller, Delete, Get, Headers, Post, Query, UseGuards } from '@nestjs/common'
import { ApiResponse } from '../common/api-response'
import { CommentService } from '../comment/comment.service'
import { DeletePostBodyDto } from '../post/dto/delete-post.dto'
import { PostReviewDto } from '../post/dto/post-review.dto'
import { UnapprovedPostsQueryDto } from '../post/dto/unapproved-posts-query.dto'
import { PostService } from '../post/post.service'
import { ShopifyAdminGuard } from './shopify-admin.guard'

@Controller('api/admin')
@UseGuards(ShopifyAdminGuard)
export class AdminController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  @Get('all')
  async getAllPostsAndCommentsForReview(@Query() query: UnapprovedPostsQueryDto, @Headers('origin') origin?: string) {
    if (!origin) {
      return new ApiResponse({
        success: false,
        message: 'Origin header is missing',
      })
    }

    try {
      const { posts, hasNextPage: hasNextPagePosts } = await this.postService.getUnapprovedPosts(
        query,
        origin,
      )
      const { comments, hasNextPage: hasNextPageComments } =
        await this.commentService.getUnapprovedComments(query, origin)

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
