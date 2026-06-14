import { Body, Controller, Delete, Patch, Post, Query } from '@nestjs/common'
import { ApiResponse } from '../common/api-response'
import { PostService } from '../post/post.service'
import { CommentService } from './comment.service'
import { CreateCommentQueryDto } from './dto/create-comment-query.dto'
import { DeleteCommentQueryDto } from './dto/delete-comment-query.dto'
import { EditCommentDto } from './dto/edit-comment.dto'

@Controller('api/comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
  ) {}

  @Post('post')
  async createCommentOnPost(@Query() query: CreateCommentQueryDto, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Shop is required',
      })
    }
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
  async editComment(@Body() dto: EditCommentDto, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Shop is required',
      })
    }

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
  async deleteComment(@Query() query: DeleteCommentQueryDto, @Query('shop') shop: string) {
    if (!shop) {
      return new ApiResponse({
        success: false,
        message: 'Shop is required',
      })
    }

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
