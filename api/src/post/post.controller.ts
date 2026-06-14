import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import type { Request } from 'express'
import { ApiResponse } from '../common/api-response'
import { ContentQueryDto } from './dto/content-query.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { DeletePostQueryDto } from './dto/delete-post.dto'
import { EditPostDto } from './dto/edit-post.dto'
import { IncrementViewDto } from './dto/increment-view.dto'
import { PostService } from './post.service'

@Controller('api/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('all')
  async getAllPosts(@Query() query: ContentQueryDto, @Query('shop') shop?: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'shop query parameter is required',
      })
    }

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
  async getById(@Param('id', ParseIntPipe) id: number, @Query('shop') shop?: string) {
    if (!shop || !id) {
      return new ApiResponse({
        success: false,
        message: 'missing query parameters',
      })
    }

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
  async create(@Body() dto: CreatePostDto, @Query('shop') shop?: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'missing shop parameter',
      })
    }

    try {
      const post = await this.postService.createPost(dto, shop)
      return new ApiResponse({
        success: true,
        message: 'Post created successfully',
        data: { userId: post.userId, id: post.id },
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

  @Post('increment-view/:postId')
  async incrementPostView(@Body() dto: IncrementViewDto, @Req() req: Request, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Missing parameters',
      })
    }

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
  async editPost(@Body() dto: EditPostDto, @Query('shop') shop?: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'missing paramater',
      })
    }
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
  async deletePost(@Query() query: DeletePostQueryDto, @Query('shop') shop?: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'shop query parameter is required',
      })
    }

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
