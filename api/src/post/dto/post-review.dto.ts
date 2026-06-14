import { IsBoolean, IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator'

export class PostReviewDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @IsBoolean()
  @IsNotEmpty()
  approved: boolean
}
