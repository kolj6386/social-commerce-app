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
