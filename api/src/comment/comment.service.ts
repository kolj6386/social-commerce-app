import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { sanitizePlainText } from '../common/sanitize-user-text'
import { Comment } from '../entities/comment.entity'
import { UnapprovedPostsQueryDto } from '../post/dto/unapproved-posts-query.dto'
import { containsBlockedLanguage } from '../shop/shop-settings'
import { ShopService } from '../shop/shop.service'
import { CreateCommentQueryDto } from './dto/create-comment-query.dto'
import { CommentReviewDto } from './dto/comment-review.dto'
import { DeleteCommentBodyDto, DeleteCommentQueryDto } from './dto/delete-comment-query.dto'
import { EditCommentDto } from './dto/edit-comment.dto'

export interface UnapprovedCommentDto {
  FirstName: string
  LastName: string
  CreatedAt: Date
  Content: string
}

export interface AdminCommentDto {
  id: number
  postId: number
  firstName: string
  lastName: string
  content: string
  createdAt: Date
  approvedComment: boolean
  postContent: string
  postFirstName: string
  postLastName: string
  postCreated: Date | null
}

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name)

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly dataSource: DataSource,
    private readonly shopService: ShopService,
  ) {}

  async createFromQuery(dto: CreateCommentQueryDto, shop: string): Promise<Comment> {
    const settings = await this.shopService.getSettings(shop)
    const isGuest = !dto.userid || dto.userid <= 0

    if (isGuest && !settings.allowGuestPosting) {
      throw new ForbiddenException('Guest commenting is disabled for this store')
    }

    const content = sanitizePlainText(dto.commentContent)
    if (containsBlockedLanguage(content, settings.languageFilter)) {
      throw new BadRequestException('Comment content was blocked by the language filter')
    }

    return this.commentRepository.create({
      userId: dto.userid,
      postId: dto.postId,
      firstName: sanitizePlainText(dto.firstName ?? ''),
      lastName: sanitizePlainText(dto.lastName ?? ''),
      content,
      createdAt: new Date(),
      approvedComment: !isGuest && settings.autoApproveLoggedInPosts,
      shopId: shop,
    })
  }

  async createCommentOnPost(comment: Comment): Promise<Comment> {
    const createdAt = comment.createdAt ?? new Date()
    const inserted = await this.dataSource.query<Comment[]>(
      `
      INSERT INTO "Comments" (
        "UserId",
        "PostId",
        "FirstName",
        "LastName",
        "Content",
        "CreatedAt",
        "ShopId",
        "ApprovedComment"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        comment.userId,
        comment.postId,
        comment.firstName ?? '',
        comment.lastName ?? '',
        comment.content,
        createdAt,
        comment.shopId,
        comment.approvedComment ?? false,
      ],
    )

    const saved = inserted[0]
    const settings = await this.shopService.getSettings(comment.shopId)
    if (settings.notificationsEnabled) {
      this.logger.log(
        `[notifications] new comment — shop=${comment.shopId}, commentId=${saved?.id}, postId=${comment.postId}`,
      )
    }

    return saved
  }

  async editComment(dto: EditCommentDto, shop: string): Promise<Comment | null> {
    const updated = await this.dataSource.query<Comment[]>(
      `
      UPDATE "Comments"
      SET "Content" = $1
      WHERE "Id" = $2 AND "UserId" = $3 AND "ShopId" = $4
      RETURNING *`,
      [sanitizePlainText(dto.commentContent), dto.commentId, dto.userid, shop],
    )

    return updated?.[0] ?? null
  }

  async deleteComment(query: DeleteCommentQueryDto, shop: string): Promise<Comment | null> {
    const deleted = await this.dataSource.query<Comment[]>(
      `
      DELETE FROM "Comments"
      WHERE "Id" = $1 AND "UserId" = $2 AND "ShopId" = $3
      RETURNING *`,
      [query.commentId, query.userid, shop],
    )

    return deleted?.[0] ?? null
  }

  async getUnapprovedComments(
    query: UnapprovedPostsQueryDto,
    storeId: string,
  ): Promise<{ comments: UnapprovedCommentDto[]; hasNextPage: boolean }> {
    const pageNumber = query.pageNumber ?? 1
    const resultsPerPage = query.resultsPerPage ?? 10

    const comments = await this.dataSource.query<UnapprovedCommentDto[]>(
      `
      SELECT
          c."FirstName",
          c."LastName",
          c."CreatedAt",
          c."Content"
      FROM "Comments" c
      WHERE c."ShopId" = $1 AND c."ApprovedComment" = false
      ORDER BY c."CreatedAt" DESC
      OFFSET $2 LIMIT $3`,
      [storeId, (pageNumber - 1) * resultsPerPage, resultsPerPage],
    )

    const totalResult = await this.dataSource.query<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM "Comments" WHERE "ShopId" = $1 AND "ApprovedComment" = false`,
      [storeId],
    )
    const totalComments = totalResult?.[0]?.count ?? 0
    const hasNextPage = pageNumber * resultsPerPage < totalComments

    return { comments: comments ?? [], hasNextPage }
  }

  async getAdminComments(
    query: {
      pageNumber?: number
      resultsPerPage?: number
      status?: 'all' | 'pending'
    },
    storeId: string,
  ): Promise<{ comments: AdminCommentDto[]; hasNextPage: boolean }> {
    const pageNumber = query.pageNumber ?? 1
    const resultsPerPage = query.resultsPerPage ?? 20
    const pendingOnly = query.status === 'pending'

    const rows = await this.dataSource.query<
      {
        Id: number
        PostId: number | string
        FirstName: string
        LastName: string
        Content: string
        CreatedAt: Date
        ApprovedComment: boolean
        PostContent: string | null
        PostFirstName: string | null
        PostLastName: string | null
        PostCreated: Date | null
      }[]
    >(
      `
      SELECT
          c."Id",
          c."PostId",
          c."FirstName",
          c."LastName",
          c."Content",
          c."CreatedAt",
          c."ApprovedComment",
          p."PostContent",
          p."FirstName" AS "PostFirstName",
          p."LastName" AS "PostLastName",
          p."PostCreated"
      FROM "Comments" c
      LEFT JOIN "Posts" p ON p."Id" = c."PostId"
      WHERE c."ShopId" = $1
        AND ($2::boolean = false OR c."ApprovedComment" = false)
      ORDER BY c."CreatedAt" DESC
      OFFSET $3 LIMIT $4`,
      [storeId, pendingOnly, (pageNumber - 1) * resultsPerPage, resultsPerPage],
    )

    const totalResult = await this.dataSource.query<{ count: number }[]>(
      `
      SELECT COUNT(*) AS count
      FROM "Comments"
      WHERE "ShopId" = $1
        AND ($2::boolean = false OR "ApprovedComment" = false)`,
      [storeId, pendingOnly],
    )
    const totalComments = Number(totalResult?.[0]?.count ?? 0)
    const hasNextPage = pageNumber * resultsPerPage < totalComments

    const comments: AdminCommentDto[] = (rows ?? []).map((row) => ({
      id: Number(row.Id),
      postId: Number(row.PostId),
      firstName: row.FirstName ?? '',
      lastName: row.LastName ?? '',
      content: row.Content ?? '',
      createdAt: row.CreatedAt,
      approvedComment: Boolean(row.ApprovedComment),
      postContent: row.PostContent ?? '',
      postFirstName: row.PostFirstName ?? '',
      postLastName: row.PostLastName ?? '',
      postCreated: row.PostCreated ?? null,
    }))

    return { comments, hasNextPage }
  }

  async approveOrDisapproveComment(dto: CommentReviewDto, shop: string): Promise<boolean> {
    if (!dto.commentId) return false

    const result = await this.dataSource.query(
      `
      UPDATE "Comments"
      SET "ApprovedComment" = $1
      WHERE "Id" = $2 AND "ShopId" = $3
      RETURNING "Id"`,
      [dto.approved, dto.commentId, shop],
    )

    return Array.isArray(result) && result.length > 0
  }

  async adminDeleteComment(dto: DeleteCommentBodyDto, shop: string): Promise<Comment | null> {
    if (!dto.commentId) return null

    const deleted = await this.dataSource.query<Comment[]>(
      `
      DELETE FROM "Comments"
      WHERE "Id" = $1 AND "ShopId" = $2
      RETURNING *`,
      [dto.commentId, shop],
    )

    return deleted?.[0] ?? null
  }
}
