import { Body, Controller, Delete, Post, Query } from '@nestjs/common'
import { ApiResponse } from '../common/api-response'
import {
  CreateCommentReactionDto,
  CreateReactionDto,
  DeleteCommentReactionDto,
  DeleteReactionDto,
} from './dto/create-reaction.dto'
import { ReactionService } from './reaction.service'

@Controller('api/reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  async createReactionOnPost(@Body() dto: CreateReactionDto, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Shop is required',
      })
    }
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
  async createReactionOnComment(@Body() dto: CreateCommentReactionDto, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Shop is required',
      })
    }

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
  async deletePostReaction(@Body() dto: DeleteReactionDto, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Shop is required',
      })
    }

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
  async deleteCommentReaction(@Body() dto: DeleteCommentReactionDto, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Shop is required',
      })
    }

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
