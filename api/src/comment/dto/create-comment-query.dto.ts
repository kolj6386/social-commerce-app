import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches, MaxLength, Min } from 'class-validator'

export class CreateCommentQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  firstName?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  lastName?: string
}
