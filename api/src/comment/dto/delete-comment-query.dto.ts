import { Type } from 'class-transformer'
import { IsInt, IsPositive, Min } from 'class-validator'

export class DeleteCommentQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  commentId: number

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  userid: number
}

/** Admin delete body */
export class DeleteCommentBodyDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  commentId: number
}
