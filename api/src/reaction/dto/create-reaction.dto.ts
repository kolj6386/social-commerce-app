import { IsInt, IsNotEmpty, IsString, IsIn, IsPositive, Min } from 'class-validator'

export class CreateReactionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['like', 'love', 'laugh', 'dislike'])
  type: string

  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @IsInt()
  @IsPositive()
  @Min(1)
  userId: number
}

export class DeleteReactionDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @IsInt()
  @IsPositive()
  @Min(1)
  userId: number
}

export class CreateCommentReactionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['like', 'love', 'laugh', 'dislike'])
  type: string

  @IsInt()
  @IsPositive()
  @Min(1)
  commentId: number

  @IsInt()
  @IsPositive()
  @Min(1)
  userId: number
}

export class DeleteCommentReactionDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  commentId: number

  @IsInt()
  @IsPositive()
  @Min(1)
  userId: number
}
