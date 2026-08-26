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
import { DeleteCommentQueryDto } from './dto/delete-comment-query.dto'
import { EditCommentDto } from './dto/edit-comment.dto'

export interface UnapprovedCommentDto {
  FirstName: string
  LastName: string
  CreatedAt: Date
  Content: string
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
}
