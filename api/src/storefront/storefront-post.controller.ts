import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { Request } from 'express'
import { Shop } from '../auth/shop.decorator'
import { ShopifyAppProxyGuard } from '../auth/shopify-app-proxy.guard'
import { ApiResponse } from '../common/api-response'
import { PaidPlanGuard } from '../common/guards/paid-plan.guard'
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard'
import { ContentQueryDto } from '../post/dto/content-query.dto'
import { CreatePostDto } from '../post/dto/create-post.dto'
import { DeletePostQueryDto } from '../post/dto/delete-post.dto'
import { EditPostDto } from '../post/dto/edit-post.dto'
import { IncrementViewDto } from '../post/dto/increment-view.dto'
import { PostService } from '../post/post.service'

@Controller('shopify-proxy/post')
@UseGuards(ShopifyAppProxyGuard, RateLimitGuard)
export class StorefrontPostController {
  constructor(private readonly postService: PostService) {}

  @Get('all')
  @UseGuards(PaidPlanGuard)
  async getAllPosts(@Query() query: ContentQueryDto, @Shop() shop: string) {
    const content = await this.postService.getAllAsync(query, shop)

    if (!content.length) {
      return new ApiResponse({
        success: true,
        message: 'No posts found',
        data: [],
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Posts retrieved successfully',
      data: content,
    })
  }

  @Get(':id')
  @UseGuards(PaidPlanGuard)
  async getById(@Param('id', ParseIntPipe) id: number, @Shop() shop: string) {
    const post = await this.postService.getById(id, shop)

    if (!post) {
      return new ApiResponse({
        success: false,
        message: 'Post not found',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Post retrieved successfully',
      data: post,
    })
  }

  @Post()
  async create(@Body() dto: CreatePostDto, @Shop() shop: string) {
    try {
      const post = await this.postService.createPost(dto, shop)
      return new ApiResponse({
        success: true,
        message: 'Post created successfully',
        data: { userId: post.userId, id: post.id },
      })
    } catch (error) {
      if (error instanceof HttpException) {
        return new ApiResponse({
          success: false,
          message: error.message,
        })
      }
      const message = error instanceof Error ? error.message : 'Unknown error'
      return new ApiResponse({
        success: false,
        message: 'An unexpected error occurred',
        errors: { Exception: [message] },
      })
    }
  }

  @Post('increment-view/:postId')
  // prettier-ignore
  async incrementPostView(
    @Body() dto: IncrementViewDto,
    @Req() req: Request,
    @Shop() shop: string,
  ) {
    const ipAddress = req.ip ?? req.socket.remoteAddress
    const view = await this.postService.addPostView(dto, ipAddress, shop)

    if (!view) {
      return new ApiResponse({
        success: true,
        message: 'View not counted or post does not exist',
      })
    }

    return new ApiResponse({
      success: true,
      message: `View added to post: ${dto.postId}`,
    })
  }

  @Patch('edit')
  async editPost(@Body() dto: EditPostDto, @Shop() shop: string) {
    const post = await this.postService.editPost(dto, shop)

    if (!post) {
      return new ApiResponse({
        success: false,
        message: 'Post not found or post does not belong to this user',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Post edited successfully',
      data: post,
    })
  }

  @Delete('delete')
  async deletePost(@Query() query: DeletePostQueryDto, @Shop() shop: string) {
    const post = await this.postService.deletePost(query, shop)

    if (!post) {
      return new ApiResponse({
        success: false,
        message: 'Post not found or post does not belong to this user',
      })
    }

    return new ApiResponse({
      success: true,
      message: 'Post deleted successfully',
      data: post,
    })
  }
}
