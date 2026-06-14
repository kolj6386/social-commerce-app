import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsPositive, IsString, Matches, Min } from 'class-validator'

export class CreateCommentQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  userid: number

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @IsString()
  @IsNotEmpty()
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  commentContent: string
}
