import { IsInt, IsNotEmpty, IsPositive, IsString, Matches, Min } from 'class-validator'

export class EditCommentDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  commentId: number

  @IsInt()
  @IsPositive()
  @Min(1)
  userid: number

  @IsString()
  @IsNotEmpty()
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  commentContent: string
}
