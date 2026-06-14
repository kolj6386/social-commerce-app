import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Comment } from '../entities/comment.entity'
import { CommentReaction } from '../entities/comment-reaction.entity'
import { Post } from '../entities/post.entity'
import { PostReaction } from '../entities/post-reaction.entity'
import {
  CreateCommentReactionDto,
  CreateReactionDto,
  DeleteCommentReactionDto,
  DeleteReactionDto,
} from './dto/create-reaction.dto'

@Injectable()
export class ReactionService {
  private readonly logger = new Logger(ReactionService.name)

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(PostReaction)
    private readonly postReactionRepository: Repository<PostReaction>,
    @InjectRepository(CommentReaction)
    private readonly commentReactionRepository: Repository<CommentReaction>,
    private readonly dataSource: DataSource,
  ) {}

  async createReactionOnPost(dto: CreateReactionDto, shop: string): Promise<boolean> {
    const postExists = await this.dataSource.query<{ exists: number }[]>(
      `SELECT 1 AS "exists" FROM "Posts" WHERE "Id" = $1 AND "ShopId" = $2 LIMIT 1`,
      [dto.postId, shop],
    )

    if (!postExists.length) {
      return false
    }

    try {
      await this.dataSource.query(
        `INSERT INTO "PostReactions" ("UserId", "PostId", "Type") 
        VALUES ($1, $2, $3)
        ON CONFLICT ("UserId", "PostId")
        DO UPDATE SET "Type" = EXCLUDED."Type"
        `,
        [dto.userId, dto.postId, dto.type],
      )
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error inserting post reaction: ${message}`)
      return false
    }
  }

  async createReactionOnComment(dto: CreateCommentReactionDto, shop: string): Promise<boolean> {
    const commentExists = await this.dataSource.query<{ exists: number }[]>(
      `SELECT 1 AS "exists" FROM "Comments" WHERE "Id" = $1 AND "ShopId" = $2 LIMIT 1`,
      [dto.commentId, shop],
    )

    if (!commentExists.length) {
      return false
    }

    try {
      await this.dataSource.query(
        `INSERT INTO "CommentReactions" ("UserId", "CommentId", "Type")
        VALUES ($1, $2, $3)
        ON CONFLICT ("UserId", "CommentId")
        DO UPDATE SET "Type" = EXCLUDED."Type"
        `,
        [dto.userId, dto.commentId, dto.type],
      )
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error inserting comment reaction: ${message}`)
      return false
    }
  }

  async deleteReactionOnPost(dto: DeleteReactionDto, shop: string): Promise<boolean> {
    const postExists = await this.dataSource.query<{ exists: number }[]>(
      `SELECT 1 AS "exists" FROM "Posts" WHERE "Id" = $1 AND "ShopId" = $2 LIMIT 1`,
      [dto.postId, shop],
    )

    if (!postExists.length) {
      return false
    }

    const reactionExists = await this.dataSource.query<{ exists: number }[]>(
      `SELECT 1 AS "exists" FROM "PostReactions" WHERE "PostId" = $1 AND "UserId" = $2 LIMIT 1`,
      [dto.postId, dto.userId],
    )

    if (!reactionExists.length) {
      return false
    }

    try {
      await this.dataSource.query(
        `DELETE FROM "PostReactions" WHERE "PostId" = $1 AND "UserId" = $2`,
        [dto.postId, dto.userId],
      )
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error deleting post reaction: ${message}`)
      return false
    }
  }

  async deleteReactionOnComment(dto: DeleteCommentReactionDto, shop: string): Promise<boolean> {
    const commentExists = await this.dataSource.query<{ exists: number }[]>(
      `SELECT 1 AS "exists" FROM "Comments" WHERE "Id" = $1 AND "ShopId" = $2 LIMIT 1`,
      [dto.commentId, shop],
    )
    if (!commentExists.length) {
      return false
    }

    const reactionExists = await this.dataSource.query<{ exists: number }[]>(
      `SELECT 1 AS "exists" FROM "CommentReactions" WHERE "CommentId" = $1 AND "UserId" = $2 LIMIT 1`,
      [dto.commentId, dto.userId],
    )

    if (!reactionExists.length) {
      return false
    }

    try {
      await this.dataSource.query(
        `DELETE FROM "CommentReactions" WHERE "CommentId" = $1 AND "UserId" = $2`,
        [dto.commentId, dto.userId],
      )
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error deleting comment reaction: ${message}`)
      return false
    }
  }
}
