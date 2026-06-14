import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { parsePostMedia } from '../common/parse-post-media'
import { sanitizeHttpsUrls, sanitizePlainText } from '../common/sanitize-user-text'
import { Post } from '../entities/post.entity'
import { PostView } from '../entities/post-view.entity'
import { ContentQueryDto } from './dto/content-query.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { DeletePostBodyDto, DeletePostQueryDto } from './dto/delete-post.dto'
import { EditPostDto } from './dto/edit-post.dto'
import { IncrementViewDto } from './dto/increment-view.dto'
import { PostReviewDto } from './dto/post-review.dto'
import { UnapprovedPostsQueryDto } from './dto/unapproved-posts-query.dto'
import {
  CommentDto,
  PostFlatRow,
  PostWithReactionsAndCommentsDto,
  UnapprovedPostDto,
} from './post.types'

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name)

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostView)
    private readonly postViewRepository: Repository<PostView>,
    private readonly dataSource: DataSource,
  ) {}

  async getAllAsync(
    query: ContentQueryDto,
    shop: string,
  ): Promise<PostWithReactionsAndCommentsDto[]> {
    const pageNumber = query.pageNumber ?? 1
    const resultsPerPage = query.resultsPerPage ?? 10
    const approvedPosts = query.approvedPosts ?? true

    const flatPosts = await this.dataSource.query<PostFlatRow[]>(
      `
      SELECT 
          p."Id" AS "PostId", 
          p."UserId" AS "PostUserId",
          p."FirstName", 
          p."LastName", 
          p."PostContent", 
          p."PostCreated", 
          p."PostViews", 
          p."PostMedia",
          c."Id" AS "CommentId",
          c."UserId" AS "CommentUserId",
          c."Content" AS "CommentContent",
          c."CreatedAt" AS "CommentCreated",
          pr."LikeCount" AS "PostLikeCount",
          pr."LoveCount" AS "PostLoveCount",
          pr."LaughCount" AS "PostLaughCount",
          pr."DislikeCount" AS "PostDislikeCount",
          cr."LikeCount" AS "CommentLikeCount",
          cr."LoveCount" AS "CommentLoveCount",
          cr."LaughCount" AS "CommentLaughCount",
          cr."DislikeCount" AS "CommentDislikeCount"
      FROM "Posts" p
      LEFT JOIN "Comments" c ON p."Id" = c."PostId"
      LEFT JOIN (
          SELECT "PostId",
              COUNT(*) FILTER (WHERE "Type" = 'like') AS "LikeCount",
              COUNT(*) FILTER (WHERE "Type" = 'love') AS "LoveCount",
              COUNT(*) FILTER (WHERE "Type" = 'laugh') AS "LaughCount",
              COUNT(*) FILTER (WHERE "Type" = 'dislike') AS "DislikeCount"
          FROM "PostReactions"
          GROUP BY "PostId"
      ) pr ON p."Id" = pr."PostId"
      LEFT JOIN (
          SELECT "CommentId",
              COUNT(*) FILTER (WHERE "Type" = 'like') AS "LikeCount",
              COUNT(*) FILTER (WHERE "Type" = 'love') AS "LoveCount",
              COUNT(*) FILTER (WHERE "Type" = 'laugh') AS "LaughCount",
              COUNT(*) FILTER (WHERE "Type" = 'dislike') AS "DislikeCount"
          FROM "CommentReactions"
          GROUP BY "CommentId"
      ) cr ON c."Id" = cr."CommentId"
      WHERE p."ShopId" = $1 AND p."ApprovedPost" = $2
      ORDER BY p."PostCreated" DESC
      OFFSET $3 LIMIT $4`,
      [shop, approvedPosts, (pageNumber - 1) * resultsPerPage, resultsPerPage],
    )

    return this.groupFlatPosts(flatPosts ?? [])
  }

  async getById(id: number, shop: string): Promise<PostWithReactionsAndCommentsDto | null> {
    if (!shop || !id) {
      return null
    }
    const flatPost = await this.dataSource.query<PostFlatRow[]>(
      `
      SELECT 
          p."Id" AS "PostId", 
          p."UserId" AS "PostUserId",
          p."FirstName", 
          p."LastName", 
          p."PostContent", 
          p."PostCreated", 
          p."PostViews", 
          p."PostMedia",
          c."Id" AS "CommentId",
          c."UserId" AS "CommentUserId",
          c."Content" AS "CommentContent",
          c."CreatedAt" AS "CommentCreated",
          pr."LikeCount" AS "PostLikeCount",
          pr."LoveCount" AS "PostLoveCount",
          pr."LaughCount" AS "PostLaughCount",
          pr."DislikeCount" AS "PostDislikeCount",
          cr."LikeCount" AS "CommentLikeCount",
          cr."LoveCount" AS "CommentLoveCount",
          cr."LaughCount" AS "CommentLaughCount",
          cr."DislikeCount" AS "CommentDislikeCount"
      FROM "Posts" p
      LEFT JOIN "Comments" c ON p."Id" = c."PostId"
      LEFT JOIN (
          SELECT "PostId",
              COUNT(*) FILTER (WHERE "Type" = 'like') AS "LikeCount",
              COUNT(*) FILTER (WHERE "Type" = 'love') AS "LoveCount",
              COUNT(*) FILTER (WHERE "Type" = 'laugh') AS "LaughCount",
              COUNT(*) FILTER (WHERE "Type" = 'dislike') AS "DislikeCount"
          FROM "PostReactions"
          GROUP BY "PostId"
      ) pr ON p."Id" = pr."PostId"
      LEFT JOIN (
          SELECT "CommentId",
              COUNT(*) FILTER (WHERE "Type" = 'like') AS "LikeCount",
              COUNT(*) FILTER (WHERE "Type" = 'love') AS "LoveCount",
              COUNT(*) FILTER (WHERE "Type" = 'laugh') AS "LaughCount",
              COUNT(*) FILTER (WHERE "Type" = 'dislike') AS "DislikeCount"
          FROM "CommentReactions"
          GROUP BY "CommentId"
      ) cr ON c."Id" = cr."CommentId"
      WHERE p."ShopId" = $1 AND p."Id" = $2`,
      [shop, id],
    )

    const grouped = this.groupFlatPosts(flatPost ?? [])
    return grouped[0] ?? null
  }

  async createPost(dto: CreatePostDto, shop: string): Promise<Post> {
    const post = this.postRepository.create({
      productId: dto.productId,
      userId: dto.userId,
      firstName: sanitizePlainText(dto.firstName),
      lastName: sanitizePlainText(dto.lastName),
      postContent: sanitizePlainText(dto.postContent),
      postCreated: new Date(),
      postMedia: JSON.stringify(sanitizeHttpsUrls(dto.postMedia ?? [])),
      postViews: 0,
      shop,
      approvedPost: false,
    })

    return this.postRepository.save(post)
  }

  async addPostView(
    query: IncrementViewDto,
    ipAddress: string | undefined,
    shop: string,
  ): Promise<PostView | null> {
    if (!ipAddress || !shop) {
      return null
    }

    // TODO Check if the post exists before continuing
    const postExists = await this.dataSource.query<PostView[]>(
      `SELECT * FROM "Posts" WHERE "Id" = $1 AND "ShopId" = $2`,
      [query.postId, shop],
    )

    if (!postExists.length) {
      return null
    }

    // Adding in guest view
    if (query.postId && query.userId == null) {
      // Check if the post view exists with ipadress & ID
      const existingGuestView = await this.dataSource.query<PostView[]>(
        `SELECT * FROM "PostViews" WHERE "PostId" = $1 AND "IpAddress" = $2 AND "ViewedAt" > NOW() - INTERVAL '12 hours'`,
        [query.postId, ipAddress],
      )

      // If it does, check if it has been viewed within 12 hours
      if (existingGuestView?.length) {
        return null
      }

      // If it hasn't increment it's view
      await this.dataSource.query(
        `UPDATE "Posts" SET "PostViews" = "PostViews" + 1 WHERE "Id" = $1`,
        [query.postId],
      )

      const viewedAt = new Date()
      const newPostView = await this.dataSource.query<PostView[]>(
        `INSERT INTO "PostViews" ("PostId", "UserId", "IpAddress", "ViewedAt") VALUES ($1, $2, $3, $4)`,
        [query.postId, null, ipAddress, viewedAt],
      )
      // if it has then return null
      return newPostView?.[0] ?? null
    }

    const existing = await this.dataSource.query<PostView[]>(
      `SELECT * FROM "PostViews" WHERE "PostId" = $1 AND "UserId" = $2 AND "ViewedAt" > NOW() - INTERVAL '12 hours'`,
      [query.postId, query.userId],
    )

    if (existing?.length) {
      return null
    }

    await this.dataSource.query(
      `UPDATE "Posts" SET "PostViews" = "PostViews" + 1 WHERE "Id" = $1`,
      [query.postId],
    )

    const viewedAt = new Date()
    await this.dataSource.query(
      `INSERT INTO "PostViews" ("PostId", "UserId", "IpAddress", "ViewedAt") VALUES ($1, $2, $3, $4)`,
      [query.postId, query.userId, ipAddress, viewedAt],
    )

    const inserted = await this.dataSource.query<PostView[]>(
      `SELECT * FROM "PostViews" WHERE "PostId" = $1 AND "UserId" = $2 AND "IpAddress" = $3 AND "ViewedAt" = $4`,
      [query.postId, query.userId, ipAddress, viewedAt],
    )

    return inserted?.[0] ?? null
  }

  async editPost(dto: EditPostDto, shop: string): Promise<Post | null> {
    const updated = await this.dataSource.query<Post[]>(
      `
      UPDATE "Posts"
      SET "PostContent" = $1
      WHERE "Id" = $2 AND "UserId" = $3 AND "ShopId" = $4
      RETURNING *`,
      [sanitizePlainText(dto.postContent), dto.postId, dto.userid, shop],
    )

    return updated?.[0] ?? null
  }

  async deletePost(query: DeletePostQueryDto, shop: string): Promise<Post | null> {
    const deleted = await this.dataSource.query<Post[]>(
      `
      DELETE FROM "Posts"
      WHERE "Id" = $1 AND "UserId" = $2 AND "ShopId" = $3
      RETURNING *`,
      [query.postId, query.userId, shop],
    )

    return deleted?.[0] ?? null
  }

  async adminDeletePost(dto: DeletePostBodyDto): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
    })

    if (!post) {
      this.logger.warn(`post not found: ${dto.postId}`)
      return null
    }

    await this.postRepository.remove(post)
    return post
  }

  async approveOrDisapprovePost(dto: PostReviewDto): Promise<boolean> {
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
    })

    if (!post) {
      return false
    }

    await this.dataSource.query(`UPDATE "Posts" SET "ApprovedPost" = $1 WHERE "Id" = $2`, [
      dto.approved,
      dto.postId,
    ])

    return true
  }

  async getUnapprovedPosts(
    query: UnapprovedPostsQueryDto,
    shopId: string,
  ): Promise<{ posts: UnapprovedPostDto[]; hasNextPage: boolean }> {
    const pageNumber = query.pageNumber ?? 1
    const resultsPerPage = query.resultsPerPage ?? 10

    const posts = await this.dataSource.query<UnapprovedPostDto[]>(
      `
      SELECT 
          p."Id", 
          p."FirstName", 
          p."LastName", 
          p."PostContent", 
          p."PostCreated",
          p."PostMedia"
      FROM "Posts" p
      WHERE p."ShopId" = $1 AND p."ApprovedPost" = false
      ORDER BY p."PostCreated" DESC
      OFFSET $2 LIMIT $3`,
      [shopId, (pageNumber - 1) * resultsPerPage, resultsPerPage],
    )

    const totalResult = await this.dataSource.query<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM "Posts" WHERE "ShopId" = $1 AND "ApprovedPost" = false`,
      [shopId],
    )
    const totalPosts = totalResult?.[0]?.count ?? 0
    const hasNextPage = pageNumber * resultsPerPage < totalPosts

    return { posts: posts ?? [], hasNextPage }
  }

  // TODO: Update this to send reactions as a number.
  private groupFlatPosts(flatPosts: PostFlatRow[]): PostWithReactionsAndCommentsDto[] {
    const byPostId = new Map<number, PostFlatRow[]>()

    for (const row of flatPosts) {
      const group = byPostId.get(row.PostId) ?? []
      group.push(row)
      byPostId.set(row.PostId, group)
    }

    return [...byPostId.entries()].map(([postId, rows]) => {
      const first = rows[0]
      const commentMap = new Map<number, PostFlatRow[]>()

      for (const row of rows) {
        if (row.CommentId != null) {
          const comments = commentMap.get(row.CommentId) ?? []
          comments.push(row)
          commentMap.set(row.CommentId, comments)
        }
      }

      const comments: CommentDto[] = [...commentMap.entries()].map(([commentId, commentRows]) => {
        const commentFirst = commentRows[0]
        return {
          id: commentId,
          userId: commentFirst.CommentUserId ?? 0,
          content: commentFirst.CommentContent ?? '',
          createdAt: commentFirst.CommentCreated ?? new Date(0),
          reactions: {
            commentLoveCount: Number(commentFirst.CommentLoveCount || 0),
            commentLikeCount: Number(commentFirst.CommentLikeCount || 0),
            commentLaughCount: Number(commentFirst.CommentLaughCount || 0),
            commentDislikeCount: Number(commentFirst.CommentDislikeCount || 0),
          },
        }
      })

      return {
        id: postId,
        userId: first.PostUserId,
        firstName: first.FirstName,
        lastName: first.LastName,
        postContent: first.PostContent,
        postCreated: first.PostCreated,
        postViews: first.PostViews,
        postMedia: parsePostMedia(first.PostMedia),
        reactions: {
          postLoveCount: Number(first.PostLoveCount || 0),
          postLikeCount: Number(first.PostLikeCount || 0),
          postLaughCount: Number(first.PostLaughCount || 0),
          postDislikeCount: Number(first.PostdislikeCount || 0),
        },
        comments,
      }
    })
  }
}
