import { IsBoolean, IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator'

export class CommentReviewDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  commentId: number

  @IsBoolean()
  @IsNotEmpty()
  approved: boolean
}
